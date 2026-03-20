import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { users, roles } from '../../database/schema';
import { RedisService } from '../../redis/redis.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthUser } from '../../common/types/auth-user.type';
import { AppRole } from '../../common/decorators/roles.decorator';
import { MailService } from '../mail/mail.service';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

interface AuthLookupRecord {
  id: string;
  email: string;
  name: string;
  status: string;
  passwordHash: string | null;
  role: AppRole;
  branchId?: string;
}

interface RegisteredUser {
  id: string;
  email: string;
  name: string;
}

interface NormalizedRegistrationInput {
  email: string;
  name: string;
  phone?: string;
  role: AppRole;
}

interface UsersColumnMeta {
  columnName: string;
  isNullable: boolean;
  hasDefault: boolean;
  dataType: string;
  udtName: string;
  isIdentity: boolean;
  isUnique: boolean;
}

interface UsersForeignKeyMeta {
  columnName: string;
  foreignTableName: string;
  foreignColumnName: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly resetTokenTtlSeconds = 3600;
  private readonly knownRoles = new Set<AppRole>([
    'SUPER_ADMIN',
    'ADMIN',
    'SYSTEM_ADMIN',
    'DIRECTOR',
    'MANAGER',
    'FINANCE_ADMIN',
    'FINANCE_OFFICER',
    'AUDITOR',
    'MODERATOR',
    'SUPPORT',
    'LEGAL',
    'BRANCH_OFFICER',
    'FIELD_OFFICER',
    'RECOVERY_AGENT',
    'VENDOR',
    'DEALER',
    'AGENT',
    'CUSTOMER',
  ]);
  private schemaColumnsCache:
    | {
        users: Set<string>;
        roles: Set<string>;
      }
    | undefined;
  private usersColumnMetaCache: Map<string, UsersColumnMeta> | undefined;
  private usersForeignKeysCache:
    | Map<string, UsersForeignKeyMeta>
    | undefined;
  private enumLabelsCache = new Map<string, string[]>();

  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
    private readonly mail: MailService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens> {
    try {
      const registration = this.normalizeRegistrationInput(dto);

      // Check email uniqueness
      const existing = await this.db.db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, registration.email))
        .limit(1);

      if (existing.length > 0) {
        throw new ConflictException('Email already registered');
      }

      const passwordHash = await bcrypt.hash(dto.password, 12);
      const user = await this.createUserAdaptive(registration, passwordHash);

      // Persist the registration role when schema supports it.
      // This is intentionally best-effort to avoid auth hard-failures on
      // partially migrated/legacy databases.
      await this.assignDefaultRole(user.id, registration.role).catch((error) => {
        this.logger.warn(
          `Role assignment fallback triggered during registration: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      });

      return this.issueTokens({
        sub: user.id,
        email: user.email,
        name: user.name,
        role: registration.role,
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      this.logger.error(
        `Register flow failed for ${dto.email.toLowerCase()}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw this.mapDatabaseErrorToHttp(
        error,
        'Unable to create account. Please review your details and try again.',
      );
    }
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    try {
      const record = await this.resolveAuthRecordByEmail(dto.email.toLowerCase());
      if (!record) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if ((record.status ?? 'ACTIVE').toUpperCase() !== 'ACTIVE') {
        throw new UnauthorizedException('Account is not active');
      }

      if (!record.passwordHash) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const passwordValid = await this.verifyPassword(
        dto.password,
        record.passwordHash,
      );
      if (!passwordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload: AuthUser = {
        sub: record.id,
        email: record.email,
        name: record.name,
        role: record.role,
        branchId: record.branchId,
      };

      return this.issueTokens(payload);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(
        `Login flow failed for ${dto.email.toLowerCase()}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async refreshTokens(userId: string, rawRefreshToken: string): Promise<AuthTokens> {
    const storedHash = await this.redis.get<string>(`refresh:${userId}`);
    if (!storedHash) {
      throw new UnauthorizedException('Refresh token expired or revoked');
    }

    const tokenValid = await bcrypt.compare(rawRefreshToken, storedHash);
    if (!tokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const record = await this.resolveAuthRecordById(userId);
    if (!record || (record.status ?? 'ACTIVE').toUpperCase() !== 'ACTIVE') {
      throw new UnauthorizedException('Account is no longer active');
    }

    return this.issueTokens({
      sub: record.id,
      email: record.email,
      name: record.name,
      role: record.role,
      branchId: record.branchId,
    });
  }

  async logout(userId: string): Promise<void> {
    await this.redis.del(`refresh:${userId}`);
  }

  /**
   * Generates a password-reset token for the given email, stores it in Redis
   * with a 1-hour TTL, dispatches the reset link via SMTP when configured,
   * and returns a generic response to prevent email enumeration.
   */
  async forgotPassword(email: string): Promise<{
    message: string;
    userId?: string;
    token?: string;
    resetUrl?: string;
    expiresInSeconds?: number;
  }> {
    try {
      const normalised = email.toLowerCase();

      const result = await this.db.db
        .select({ id: users.id, email: users.email, name: users.name })
        .from(users)
        .where(eq(users.email, normalised))
        .limit(1);

      if (result.length > 0) {
        const token = crypto.randomBytes(32).toString('hex');
        // Store hashed token: reset:<userId> → token hash, TTL = 1 hour
        const tokenHash = await bcrypt.hash(token, 10);
        await this.redis.set(
          `reset:${result[0].id}`,
          tokenHash,
          this.resetTokenTtlSeconds,
        );
        this.logger.log(`Password reset token generated for user ${result[0].id}`);

        const exposeResetToken =
          this.config.get<string>('AUTH_EXPOSE_RESET_TOKEN') === 'true';
        const resetUrl = this.buildPasswordResetUrl(result[0].id, token);
        const resendUrl = this.buildForgotPasswordUrl(result[0].email);

        if (exposeResetToken) {
          return {
            message:
              'If that email is registered you will receive a reset link shortly.',
            userId: result[0].id,
            token,
            resetUrl,
            expiresInSeconds: this.resetTokenTtlSeconds,
          };
        }

        const emailSent = await this.mail.sendPasswordResetEmail({
          to: result[0].email,
          name: result[0].name,
          resetUrl,
          resendUrl,
          expiresInMinutes: Math.floor(this.resetTokenTtlSeconds / 60),
        });

        if (!emailSent) {
          this.logger.warn(
            `Password reset token created for ${result[0].id}, but email delivery was not completed.`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Forgot-password flow failed for ${email.toLowerCase()}`,
        error instanceof Error ? error.stack : String(error),
      );
    }

    // Always return the same message to prevent email enumeration
    return { message: 'If that email is registered you will receive a reset link shortly.' };
  }

  async resetPassword(
    userId: string,
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    try {
      const resetKey = `reset:${userId}`;
      const storedHash = await this.redis.get<string>(resetKey);
      if (!storedHash) {
        throw new BadRequestException('Reset token is invalid or expired');
      }

      const tokenValid = await this.verifyPassword(token, storedHash);
      if (!tokenValid) {
        throw new BadRequestException('Reset token is invalid or expired');
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);
      await this.updateUserPasswordAdaptive(userId, passwordHash);

      await this.redis.del(resetKey, `refresh:${userId}`);

      return { message: 'Password reset successful. Please log in with your new password.' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(
        `Reset-password flow failed for user ${userId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw this.mapDatabaseErrorToHttp(
        error,
        'Unable to reset password. Please request a new reset link and try again.',
      );
    }
  }

  async getMe(userId: string): Promise<Omit<AuthUser, 'sub'> & { id: string }> {
    const record = await this.resolveAuthRecordById(userId);
    if (!record) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: record.id,
      email: record.email,
      name: record.name,
      role: record.role,
      branchId: record.branchId,
    };
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private normalizeRegistrationInput(dto: RegisterDto): NormalizedRegistrationInput {
    const email = dto.email.toLowerCase().trim();
    const preferredName = (dto.name ?? dto.fullName ?? '').trim();
    if (!preferredName || preferredName.length < 2) {
      throw new BadRequestException('Name must be at least 2 characters');
    }

    return {
      email,
      name: preferredName,
      phone: dto.phone?.trim() || undefined,
      role: this.resolveRegistrationRole(dto.role, dto.isDealer),
    };
  }

  private resolveRegistrationRole(
    requestedRole?: string,
    isDealer?: boolean,
  ): AppRole {
    if (isDealer === true) {
      return 'VENDOR';
    }

    const normalized = requestedRole?.trim().toUpperCase();
    if (!normalized) {
      return 'CUSTOMER';
    }

    // Public self-registration is restricted to market participant roles.
    if (
      normalized === 'VENDOR' ||
      normalized === 'DEALER' ||
      normalized === 'AGENT'
    ) {
      return normalized === 'DEALER' ? 'VENDOR' : (normalized as AppRole);
    }

    return 'CUSTOMER';
  }

  private async createUserAdaptive(
    input: NormalizedRegistrationInput,
    passwordHash: string,
  ): Promise<RegisteredUser> {
    const cols = await this.getSchemaColumns();
    const usersCols = cols.users;
    const rolesCols = cols.roles;
    const usersMeta = await this.getUsersColumnMeta();
    const usersForeignKeys = await this.getUsersForeignKeys();

    const valuesByColumn = new Map<string, unknown>();
    const setValue = (column: string, value: unknown) => {
      if (!usersCols.has(column)) return;
      if (!valuesByColumn.has(column)) {
        valuesByColumn.set(column, value);
      }
    };

    setValue('email', input.email);

    if (usersCols.has('password_hash')) {
      setValue('password_hash', passwordHash);
    }
    if (usersCols.has('password')) {
      setValue('password', passwordHash);
    }
    if (!valuesByColumn.has('password_hash') && !valuesByColumn.has('password')) {
      throw new Error(
        "Users schema has neither 'password_hash' nor 'password' column",
      );
    }

    setValue('name', input.name);
    setValue('first_name', input.name);
    setValue('last_name', '');
    setValue('status', 'ACTIVE');
    setValue('role', input.role);
    setValue('user_role', input.role);
    setValue('user_type', input.role);
    setValue('account_type', input.role);
    setValue('updated_at', new Date());

    if (input.phone) {
      setValue('phone', input.phone);
    }

    // Legacy schema compatibility: users.role_id references a lookup roles table.
    if (usersCols.has('role_id')) {
      const roleId = await this.ensureRoleId(input.role, rolesCols);
      if (roleId) {
        setValue('role_id', roleId);
      }
    }

    for (const [column, meta] of usersMeta.entries()) {
      if (valuesByColumn.has(column)) continue;
      if (meta.isNullable || meta.hasDefault || meta.isIdentity) continue;

      const fallback = await this.inferRequiredUserColumnValue(
        column,
        meta,
        input,
        usersForeignKeys,
        rolesCols,
      );
      if (fallback !== undefined) {
        valuesByColumn.set(column, fallback);
        continue;
      }

      throw new Error(
        `Users schema requires non-null column '${column}' without default; no auth fallback available`,
      );
    }

    const columns = Array.from(valuesByColumn.keys());
    const values = columns.map((column) => valuesByColumn.get(column));
    const placeholders = Array.from(
      { length: columns.length },
      (_, i) => `$${i + 1}`,
    );
    const nameExpr = this.buildNameExpression(usersCols);

    type Row = { id: string; email: string; name: string | null };
    const rows = await this.db.executeRaw<Row>(
      `INSERT INTO ${this.quoteIdentifier('users')} (${columns.map((column) => this.quoteIdentifier(column)).join(', ')})
       VALUES (${placeholders.join(', ')})
       RETURNING id::text AS id, ${this.quoteIdentifier('email')} AS email, ${nameExpr} AS name`,
      values,
    );

    const user = rows[0];
    if (!user) {
      throw new Error('User insert failed: no row returned');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name ?? input.name ?? user.email.split('@')[0] ?? 'User',
    };
  }

  private async inferRequiredUserColumnValue(
    column: string,
    meta: UsersColumnMeta,
    input: NormalizedRegistrationInput,
    usersForeignKeys: Map<string, UsersForeignKeyMeta>,
    rolesCols: Set<string>,
  ): Promise<unknown | undefined> {
    const name = column.toLowerCase();
    const emailLocalPart = input.email.split('@')[0] ?? 'user';

    if (name === 'email') return input.email;
    if (name === 'name') return input.name;
    if (name === 'first_name') return input.name;
    if (name === 'last_name') return '';
    if (name === 'status') return 'ACTIVE';
    if (name === 'role') return input.role;
    if (name === 'user_role') return input.role;
    if (name === 'user_type') return input.role;
    if (name === 'account_type') return input.role;
    if (name === 'username' || name === 'user_name') {
      return meta.isUnique ? `${emailLocalPart}_${crypto.randomBytes(3).toString('hex')}` : emailLocalPart;
    }
    if (name === 'display_name') return input.name;
    if (name === 'full_name') return input.name;
    if (name === 'phone') return input.phone ?? '';

    if (name.endsWith('_at')) return new Date();
    if (name.startsWith('is_') || name.startsWith('has_')) return false;

    const foreignKey = usersForeignKeys.get(column);
    if (foreignKey) {
      if (foreignKey.foreignTableName === 'roles') {
        const roleId = await this.ensureRoleId(input.role, rolesCols);
        if (roleId) {
          return roleId;
        }
      }

      const refRows = await this.db.executeRaw<{ value: string }>(
        `SELECT ${this.quoteIdentifier(foreignKey.foreignColumnName)}::text AS value
           FROM ${this.quoteIdentifier(foreignKey.foreignTableName)}
          LIMIT 1`,
      );
      if (refRows[0]?.value) {
        return refRows[0].value;
      }
    }

    const lowerDataType = meta.dataType.toLowerCase();
    const lowerUdt = meta.udtName.toLowerCase();

    if (lowerDataType === 'user-defined') {
      const labels = await this.getEnumLabels(meta.udtName);
      if (labels.length > 0) {
        const normalizedLabels = new Map(
          labels.map((label) => [label.toUpperCase(), label]),
        );

        if (name.includes('status') && normalizedLabels.has('ACTIVE')) {
          return normalizedLabels.get('ACTIVE');
        }
        if (
          (name.includes('role') ||
            name.includes('type') ||
            name.includes('account')) &&
          normalizedLabels.has(input.role)
        ) {
          return normalizedLabels.get(input.role);
        }
        if (
          (name.includes('role') ||
            name.includes('type') ||
            name.includes('account')) &&
          normalizedLabels.has('CUSTOMER')
        ) {
          return normalizedLabels.get('CUSTOMER');
        }

        return labels[0];
      }
    }

    if (lowerDataType === 'boolean' || lowerUdt === 'bool') return false;
    if (
      lowerDataType === 'smallint' ||
      lowerDataType === 'integer' ||
      lowerDataType === 'bigint' ||
      lowerDataType === 'numeric' ||
      lowerDataType === 'real' ||
      lowerDataType === 'double precision'
    ) {
      return 0;
    }
    if (
      lowerDataType === 'character varying' ||
      lowerDataType === 'character' ||
      lowerDataType === 'text'
    ) {
      if (meta.isUnique) {
        return `${emailLocalPart}_${crypto.randomBytes(4).toString('hex')}`;
      }
      return '';
    }
    if (lowerDataType === 'uuid' || lowerUdt === 'uuid') {
      return crypto.randomUUID();
    }
    if (
      lowerDataType.startsWith('timestamp') ||
      lowerDataType === 'date' ||
      lowerDataType === 'time'
    ) {
      return new Date();
    }
    if (lowerDataType === 'json' || lowerDataType === 'jsonb') {
      return {};
    }

    return undefined;
  }

  private async ensureRoleId(
    role: AppRole,
    rolesCols: Set<string>,
  ): Promise<string | null> {
    if (!rolesCols.has('id')) return null;

    const roleColumn = rolesCols.has('role')
      ? 'role'
      : rolesCols.has('name')
        ? 'name'
        : null;

    if (!roleColumn) return null;
    const roleIdentifier = this.quoteIdentifier(roleColumn);

    const existing = await this.db.executeRaw<{ id: string }>(
      `SELECT id::text AS id
         FROM ${this.quoteIdentifier('roles')}
        WHERE UPPER(${roleIdentifier}) = UPPER($1)
        LIMIT 1`,
      [role],
    );
    if (existing[0]?.id) {
      return existing[0].id;
    }

    // If this roles schema is user-bound (roles.user_id required), we should
    // not create a global role lookup record.
    if (rolesCols.has('user_id')) {
      return null;
    }

    const insertColumns = [roleColumn];
    const insertValues: unknown[] = [role];

    if (rolesCols.has('created_at')) {
      insertColumns.push('created_at');
      insertValues.push(new Date());
    }

    const placeholders = insertValues.map((_, i) => `$${i + 1}`).join(', ');
    const created = await this.db.executeRaw<{ id: string }>(
      `INSERT INTO ${this.quoteIdentifier('roles')} (${insertColumns.map((column) => this.quoteIdentifier(column)).join(', ')})
       VALUES (${placeholders})
       RETURNING id::text AS id`,
      insertValues,
    );

    return created[0]?.id ?? null;
  }

  private async assignDefaultRole(userId: string, role: AppRole): Promise<void> {
    const cols = await this.getSchemaColumns();
    const usersCols = cols.users;
    const rolesCols = cols.roles;

    // Modern schema: roles(user_id, role, ...)
    if (rolesCols.has('user_id') && rolesCols.has('role')) {
      const withCreatedAt = rolesCols.has('created_at');
      await this.db.executeRaw(
        `INSERT INTO ${this.quoteIdentifier('roles')} (user_id, role${withCreatedAt ? ', created_at' : ''})
         VALUES ($1, $2${withCreatedAt ? ', NOW()' : ''})`,
        [userId, role],
      );
      return;
    }

    // Transitional schema: roles(user_id, name, ...)
    if (rolesCols.has('user_id') && rolesCols.has('name')) {
      const withCreatedAt = rolesCols.has('created_at');
      await this.db.executeRaw(
        `INSERT INTO ${this.quoteIdentifier('roles')} (user_id, name${withCreatedAt ? ', created_at' : ''})
         VALUES ($1, $2${withCreatedAt ? ', NOW()' : ''})`,
        [userId, role],
      );
      return;
    }

    // Legacy lookup schema: users.role_id -> roles.id (with roles.name/role)
    if (usersCols.has('role_id') && rolesCols.has('id')) {
      const roleId = await this.ensureRoleId(role, rolesCols);
      if (roleId) {
        await this.db.executeRaw(
          `UPDATE ${this.quoteIdentifier('users')} SET ${this.quoteIdentifier('role_id')} = $1 WHERE ${this.quoteIdentifier('id')} = $2`,
          [roleId, userId],
        );
        return;
      }
    }

    this.logger.warn(
      `Skipping default role persistence (${role}): no compatible users/roles schema mapping found`,
    );
  }

  private async verifyPassword(
    plainPassword: string,
    storedPassword: string,
  ): Promise<boolean> {
    const bcryptLike = /^\$2[aby]\$\d{2}\$/.test(storedPassword);
    if (bcryptLike) {
      try {
        return await bcrypt.compare(plainPassword, storedPassword);
      } catch {
        return false;
      }
    }

    // Legacy fallback: plain-text records are treated as-is.
    return plainPassword === storedPassword;
  }

  private async updateUserPasswordAdaptive(
    userId: string,
    passwordHash: string,
  ): Promise<void> {
    const cols = await this.getSchemaColumns();
    const usersCols = cols.users;

    const setFragments: string[] = [];
    const values: unknown[] = [];
    let param = 1;

    if (usersCols.has('password_hash')) {
      setFragments.push(`${this.quoteIdentifier('password_hash')} = $${param}`);
      values.push(passwordHash);
      param += 1;
    }
    if (usersCols.has('password')) {
      setFragments.push(`${this.quoteIdentifier('password')} = $${param}`);
      values.push(passwordHash);
      param += 1;
    }
    if (usersCols.has('updated_at')) {
      setFragments.push(`${this.quoteIdentifier('updated_at')} = NOW()`);
    }

    if (setFragments.length === 0) {
      throw new Error(
        "Users schema has neither 'password_hash' nor 'password' column",
      );
    }

    type Row = { id: string };
    const rows = await this.db.executeRaw<Row>(
      `UPDATE ${this.quoteIdentifier('users')}
          SET ${setFragments.join(', ')}
        WHERE ${this.quoteIdentifier('id')} = $${param}
      RETURNING id::text AS id`,
      [...values, userId],
    );

    if (rows.length === 0) {
      throw new BadRequestException('Reset token is invalid or expired');
    }
  }

  private normalizeRole(role: string | null | undefined): AppRole {
    const value = (role ?? '').toUpperCase() as AppRole;
    if (this.knownRoles.has(value)) {
      return value;
    }
    return 'CUSTOMER';
  }

  private quoteIdentifier(identifier: string): string {
    return `"${identifier.replace(/"/g, '""')}"`;
  }

  private mapDatabaseErrorToHttp(
    error: unknown,
    fallbackMessage: string,
  ): BadRequestException | ConflictException {
    if (error instanceof ConflictException || error instanceof BadRequestException) {
      return error;
    }

    if (!error || typeof error !== 'object') {
      return new BadRequestException(fallbackMessage);
    }

    const pgError = error as {
      code?: string;
      detail?: string;
      column?: string;
      constraint?: string;
      message?: string;
    };

    switch (pgError.code) {
      case '23505': {
        const detail = pgError.detail ?? '';
        const keyMatch = detail.match(/Key \(([^)]+)\)=/i);
        const key = keyMatch?.[1]?.toLowerCase();
        if (key?.includes('email')) {
          return new ConflictException('Email already registered');
        }
        return new ConflictException('Duplicate value violates uniqueness constraints');
      }
      case '23502': {
        const col = pgError.column ?? 'required field';
        return new BadRequestException(`Missing required field: ${col}`);
      }
      case '23503': {
        const col = pgError.column ?? 'related field';
        return new BadRequestException(`Invalid related value for: ${col}`);
      }
      case '22P02':
        return new BadRequestException('Invalid field format in submitted data');
      case '23514':
        return new BadRequestException(
          pgError.message ?? 'Submitted data violates a database constraint',
        );
      default:
        return new BadRequestException(fallbackMessage);
    }
  }

  private async getSchemaColumns(): Promise<{
    users: Set<string>;
    roles: Set<string>;
  }> {
    if (this.schemaColumnsCache) {
      return this.schemaColumnsCache;
    }

    const rows = await this.db.executeRaw<{
      table_name: string;
      column_name: string;
    }>(
      `SELECT table_name, column_name
         FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name IN ('users', 'roles')`,
    );

    const usersCols = new Set<string>();
    const rolesCols = new Set<string>();

    for (const row of rows) {
      if (row.table_name === 'users') usersCols.add(row.column_name);
      if (row.table_name === 'roles') rolesCols.add(row.column_name);
    }

    this.schemaColumnsCache = { users: usersCols, roles: rolesCols };
    return this.schemaColumnsCache;
  }

  private async getUsersColumnMeta(): Promise<Map<string, UsersColumnMeta>> {
    if (this.usersColumnMetaCache) {
      return this.usersColumnMetaCache;
    }

    type Row = {
      column_name: string;
      is_nullable: 'YES' | 'NO';
      column_default: string | null;
      data_type: string;
      udt_name: string;
      is_identity: 'YES' | 'NO';
    };

    const rows = await this.db.executeRaw<Row>(
      `SELECT
         column_name,
         is_nullable,
         column_default,
         data_type,
         udt_name,
         is_identity
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'users'`,
    );

    type UniqueRow = { column_name: string };
    const uniqueRows = await this.db.executeRaw<UniqueRow>(
      `SELECT DISTINCT kcu.column_name
         FROM information_schema.table_constraints tc
         JOIN information_schema.key_column_usage kcu
           ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.table_schema = 'public'
          AND tc.table_name = 'users'
          AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE')`,
    );
    const uniqueColumns = new Set(uniqueRows.map((row) => row.column_name));

    const meta = new Map<string, UsersColumnMeta>();
    for (const row of rows) {
      meta.set(row.column_name, {
        columnName: row.column_name,
        isNullable: row.is_nullable === 'YES',
        hasDefault: row.column_default !== null,
        dataType: row.data_type,
        udtName: row.udt_name,
        isIdentity: row.is_identity === 'YES',
        isUnique: uniqueColumns.has(row.column_name),
      });
    }

    this.usersColumnMetaCache = meta;
    return this.usersColumnMetaCache;
  }

  private async getUsersForeignKeys(): Promise<Map<string, UsersForeignKeyMeta>> {
    if (this.usersForeignKeysCache) {
      return this.usersForeignKeysCache;
    }

    type Row = {
      column_name: string;
      foreign_table_name: string;
      foreign_column_name: string;
    };

    const rows = await this.db.executeRaw<Row>(
      `SELECT
         kcu.column_name,
         ccu.table_name AS foreign_table_name,
         ccu.column_name AS foreign_column_name
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
       JOIN information_schema.constraint_column_usage ccu
         ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
       WHERE tc.table_schema = 'public'
         AND tc.table_name = 'users'
         AND tc.constraint_type = 'FOREIGN KEY'`,
    );

    const map = new Map<string, UsersForeignKeyMeta>();
    for (const row of rows) {
      map.set(row.column_name, {
        columnName: row.column_name,
        foreignTableName: row.foreign_table_name,
        foreignColumnName: row.foreign_column_name,
      });
    }

    this.usersForeignKeysCache = map;
    return this.usersForeignKeysCache;
  }

  private async getEnumLabels(enumTypeName: string): Promise<string[]> {
    const cached = this.enumLabelsCache.get(enumTypeName);
    if (cached) {
      return cached;
    }

    type Row = { enumlabel: string };
    const rows = await this.db.executeRaw<Row>(
      `SELECT e.enumlabel
         FROM pg_type t
         JOIN pg_enum e ON e.enumtypid = t.oid
        WHERE t.typname = $1
        ORDER BY e.enumsortorder`,
      [enumTypeName],
    );

    const labels = rows.map((row) => row.enumlabel);
    this.enumLabelsCache.set(enumTypeName, labels);
    return labels;
  }

  private async resolveAuthRecordByEmail(
    email: string,
  ): Promise<AuthLookupRecord | null> {
    return this.resolveAuthRecord('email', email);
  }

  private buildPasswordResetUrl(userId: string, token: string): string {
    const sanitizedWebBase = this.getSanitizedWebBaseUrl();

    return `${sanitizedWebBase}/reset-password?uid=${encodeURIComponent(
      userId,
    )}&token=${encodeURIComponent(token)}`;
  }

  private buildForgotPasswordUrl(email: string): string {
    const sanitizedWebBase = this.getSanitizedWebBaseUrl();

    return `${sanitizedWebBase}/forgot-password?email=${encodeURIComponent(email)}`;
  }

  private getSanitizedWebBaseUrl(): string {
    const webBase =
      this.config.get<string>('WEB_APP_URL') ??
      this.config.get<string>('NEXT_PUBLIC_SITE_URL') ??
      'https://jefflinkcars.com';
    return webBase.replace(/\/+$/, '');
  }

  private async resolveAuthRecordById(
    userId: string,
  ): Promise<AuthLookupRecord | null> {
    return this.resolveAuthRecord('id', userId);
  }

  private async resolveAuthRecord(
    by: 'email' | 'id',
    value: string,
  ): Promise<AuthLookupRecord | null> {
    const cols = await this.getSchemaColumns();
    const usersCols = cols.users;
    const rolesCols = cols.roles;
    const uCol = (name: string) => `u.${this.quoteIdentifier(name)}`;
    const rCol = (name: string) => `r.${this.quoteIdentifier(name)}`;

    const nameExpr = this.buildNameExpression(usersCols, 'u');

    const statusExpr = usersCols.has('status')
      ? `COALESCE(NULLIF(${uCol('status')}, ''), 'ACTIVE')`
      : `'ACTIVE'`;

    let passwordExpr = `NULL`;
    if (usersCols.has('password_hash') && usersCols.has('password')) {
      passwordExpr = `COALESCE(NULLIF(${uCol('password_hash')}, ''), NULLIF(${uCol('password')}, ''))`;
    } else if (usersCols.has('password_hash')) {
      passwordExpr = `NULLIF(${uCol('password_hash')}, '')`;
    } else if (usersCols.has('password')) {
      passwordExpr = `NULLIF(${uCol('password')}, '')`;
    }

    const joinClauses: string[] = [];
    if (rolesCols.has('user_id')) joinClauses.push(`${rCol('user_id')} = ${uCol('id')}`);
    if (rolesCols.has('id') && usersCols.has('role_id')) {
      joinClauses.push(`${rCol('id')} = ${uCol('role_id')}`);
    }
    const shouldJoinRoles = joinClauses.length > 0;

    const roleCandidates: string[] = [];
    if (shouldJoinRoles && rolesCols.has('role')) {
      roleCandidates.push(`NULLIF(${rCol('role')}, '')`);
    }
    if (shouldJoinRoles && rolesCols.has('name')) {
      roleCandidates.push(`NULLIF(${rCol('name')}, '')`);
    }
    const roleExpr =
      roleCandidates.length > 0
        ? `COALESCE(${roleCandidates.join(', ')}, 'CUSTOMER')`
        : `'CUSTOMER'`;

    const branchCandidates: string[] = [];
    if (shouldJoinRoles && rolesCols.has('branch_id')) {
      branchCandidates.push(`${rCol('branch_id')}::text`);
    }
    if (usersCols.has('branch_id')) {
      branchCandidates.push(`${uCol('branch_id')}::text`);
    }
    const branchExpr =
      branchCandidates.length > 0
        ? `COALESCE(${branchCandidates.join(', ')})`
        : `NULL`;

    let query = `
      SELECT
        ${uCol('id')}::text        AS id,
        ${uCol('email')}           AS email,
        ${nameExpr}                AS name,
        ${statusExpr}              AS status,
        ${passwordExpr}            AS password_hash,
        ${roleExpr}                AS role,
        ${branchExpr}              AS branch_id
      FROM ${this.quoteIdentifier('users')} u
    `;

    if (shouldJoinRoles) {
      query += ` LEFT JOIN ${this.quoteIdentifier('roles')} r ON (${joinClauses.join(' OR ')}) `;
    }

    query +=
      by === 'email'
        ? ` WHERE LOWER(${uCol('email')}) = LOWER($1) `
        : ` WHERE ${uCol('id')} = $1 `;

    query += ` LIMIT 1`;

    type RawRow = {
      id: string;
      email: string;
      name: string | null;
      status: string | null;
      password_hash: string | null;
      role: string | null;
      branch_id: string | null;
    };

    const rows = await this.db.executeRaw<RawRow>(query, [value]);
    const row = rows[0];
    if (!row) return null;

    return {
      id: row.id,
      email: row.email,
      name: row.name ?? row.email.split('@')[0] ?? 'User',
      status: row.status ?? 'ACTIVE',
      passwordHash: row.password_hash,
      role: this.normalizeRole(row.role),
      branchId: row.branch_id ?? undefined,
    };
  }

  private buildNameExpression(usersCols: Set<string>, alias?: string): string {
    const col = (name: string) =>
      alias ? `${alias}.${this.quoteIdentifier(name)}` : this.quoteIdentifier(name);
    const candidates: string[] = [];

    if (usersCols.has('name')) {
      candidates.push(`NULLIF(${col('name')}, '')`);
    }

    const hasFirst = usersCols.has('first_name');
    const hasLast = usersCols.has('last_name');
    if (hasFirst || hasLast) {
      const firstExpr = hasFirst ? `COALESCE(${col('first_name')}, '')` : `''`;
      const lastExpr = hasLast ? `COALESCE(${col('last_name')}, '')` : `''`;
      candidates.push(`NULLIF(TRIM(${firstExpr} || ' ' || ${lastExpr}), '')`);
    }

    candidates.push(`SPLIT_PART(${col('email')}, '@', 1)`);
    return `COALESCE(${candidates.join(', ')})`;
  }

  private async issueTokens(payload: AuthUser): Promise<AuthTokens> {
    const accessSecret =
      this.config.get<string>('jwt.secret') ??
      this.config.get<string>('JWT_SECRET') ??
      'secret';
    const refreshSecret =
      this.config.get<string>('jwt.refreshSecret') ??
      this.config.get<string>('JWT_REFRESH_SECRET') ??
      'secret-refresh';
    const accessExpiresIn =
      this.config.get<string>('jwt.expiresIn') ?? '15m';
    const refreshExpiresIn =
      this.config.get<string>('jwt.refreshExpiresIn') ?? '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, { secret: accessSecret, expiresIn: accessExpiresIn }),
      this.jwt.signAsync({ sub: payload.sub }, { secret: refreshSecret, expiresIn: refreshExpiresIn }),
    ]);

    // Store hashed refresh token in Redis (TTL = 7 days = 604800s)
    const refreshHash = await bcrypt.hash(refreshToken, 10);
    await this.redis.set(`refresh:${payload.sub}`, refreshHash, 604_800);

    return {
      accessToken,
      refreshToken,
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      },
    };
  }
}
