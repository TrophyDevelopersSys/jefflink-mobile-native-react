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
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens> {
    try {
      // Check email uniqueness
      const existing = await this.db.db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, dto.email.toLowerCase()))
        .limit(1);

      if (existing.length > 0) {
        throw new ConflictException('Email already registered');
      }

      const passwordHash = await bcrypt.hash(dto.password, 12);
      const user = await this.createUserAdaptive(dto, passwordHash);

      // Persist a default CUSTOMER role when schema supports it.
      // This is intentionally best-effort to avoid auth hard-failures on
      // partially migrated/legacy databases.
      await this.assignDefaultRole(user.id).catch((error) => {
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
        role: 'CUSTOMER',
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
   * with a 1-hour TTL, and returns a generic response (to prevent email
   * enumeration).  Actual email dispatch should be wired up here once a
   * mailer service is available.
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
        .select({ id: users.id })
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
          this.config.get<string>('AUTH_EXPOSE_RESET_TOKEN') === 'true' ||
          this.config.get<string>('NODE_ENV') !== 'production';

        if (exposeResetToken) {
          const webBase =
            this.config.get<string>('WEB_APP_URL') ??
            this.config.get<string>('NEXT_PUBLIC_SITE_URL') ??
            'https://jefflinkcars.com';
          const sanitizedWebBase = webBase.replace(/\/+$/, '');
          const resetUrl = `${sanitizedWebBase}/reset-password?uid=${encodeURIComponent(
            result[0].id,
          )}&token=${encodeURIComponent(token)}`;

          return {
            message:
              'If that email is registered you will receive a reset link shortly.',
            userId: result[0].id,
            token,
            resetUrl,
            expiresInSeconds: this.resetTokenTtlSeconds,
          };
        }

        // TODO: dispatch email with reset link once MailerService is integrated
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

  private async createUserAdaptive(
    dto: RegisterDto,
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

    const normalizedEmail = dto.email.toLowerCase();
    setValue('email', normalizedEmail);

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

    setValue('name', dto.name);
    setValue('first_name', dto.name);
    setValue('last_name', '');
    setValue('status', 'ACTIVE');
    setValue('updated_at', new Date());

    const phone = dto.phone?.trim();
    if (phone) {
      setValue('phone', phone);
    }

    // Legacy schema compatibility: users.role_id references a lookup roles table.
    if (usersCols.has('role_id')) {
      const roleId = await this.ensureCustomerRoleId(rolesCols);
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
        dto,
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
      `INSERT INTO users (${columns.join(', ')})
       VALUES (${placeholders.join(', ')})
       RETURNING id::text AS id, email, ${nameExpr} AS name`,
      values,
    );

    const user = rows[0];
    if (!user) {
      throw new Error('User insert failed: no row returned');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name ?? dto.name ?? user.email.split('@')[0] ?? 'User',
    };
  }

  private async inferRequiredUserColumnValue(
    column: string,
    meta: UsersColumnMeta,
    dto: RegisterDto,
    usersForeignKeys: Map<string, UsersForeignKeyMeta>,
    rolesCols: Set<string>,
  ): Promise<unknown | undefined> {
    const name = column.toLowerCase();
    const emailLocalPart = dto.email.toLowerCase().split('@')[0] ?? 'user';

    if (name === 'email') return dto.email.toLowerCase();
    if (name === 'name') return dto.name;
    if (name === 'first_name') return dto.name;
    if (name === 'last_name') return '';
    if (name === 'status') return 'ACTIVE';
    if (name === 'role') return 'CUSTOMER';
    if (name === 'user_role') return 'CUSTOMER';
    if (name === 'user_type') return 'CUSTOMER';
    if (name === 'account_type') return 'CUSTOMER';
    if (name === 'username' || name === 'user_name') {
      return meta.isUnique ? `${emailLocalPart}_${crypto.randomBytes(3).toString('hex')}` : emailLocalPart;
    }
    if (name === 'display_name') return dto.name;
    if (name === 'full_name') return dto.name;
    if (name === 'phone') return dto.phone?.trim() ?? '';

    if (name.endsWith('_at')) return new Date();
    if (name.startsWith('is_') || name.startsWith('has_')) return false;

    const foreignKey = usersForeignKeys.get(column);
    if (foreignKey) {
      if (foreignKey.foreignTableName === 'roles') {
        const roleId = await this.ensureCustomerRoleId(rolesCols);
        if (roleId) {
          return roleId;
        }
      }

      const refRows = await this.db.executeRaw<{ value: string }>(
        `SELECT ${foreignKey.foreignColumnName}::text AS value
           FROM ${foreignKey.foreignTableName}
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

  private async ensureCustomerRoleId(rolesCols: Set<string>): Promise<string | null> {
    if (!rolesCols.has('id')) return null;

    const roleColumn = rolesCols.has('role')
      ? 'role'
      : rolesCols.has('name')
        ? 'name'
        : null;

    if (!roleColumn) return null;

    const existing = await this.db.executeRaw<{ id: string }>(
      `SELECT id::text AS id
         FROM roles
        WHERE LOWER(${roleColumn}) = 'customer'
        LIMIT 1`,
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
    const insertValues: unknown[] = ['CUSTOMER'];

    if (rolesCols.has('created_at')) {
      insertColumns.push('created_at');
      insertValues.push(new Date());
    }

    const placeholders = insertValues.map((_, i) => `$${i + 1}`).join(', ');
    const created = await this.db.executeRaw<{ id: string }>(
      `INSERT INTO roles (${insertColumns.join(', ')})
       VALUES (${placeholders})
       RETURNING id::text AS id`,
      insertValues,
    );

    return created[0]?.id ?? null;
  }

  private async assignDefaultRole(userId: string): Promise<void> {
    const cols = await this.getSchemaColumns();
    const usersCols = cols.users;
    const rolesCols = cols.roles;

    // Modern schema: roles(user_id, role, ...)
    if (rolesCols.has('user_id') && rolesCols.has('role')) {
      const withCreatedAt = rolesCols.has('created_at');
      await this.db.executeRaw(
        `INSERT INTO roles (user_id, role${withCreatedAt ? ', created_at' : ''})
         VALUES ($1, 'CUSTOMER'${withCreatedAt ? ', NOW()' : ''})`,
        [userId],
      );
      return;
    }

    // Transitional schema: roles(user_id, name, ...)
    if (rolesCols.has('user_id') && rolesCols.has('name')) {
      const withCreatedAt = rolesCols.has('created_at');
      await this.db.executeRaw(
        `INSERT INTO roles (user_id, name${withCreatedAt ? ', created_at' : ''})
         VALUES ($1, 'CUSTOMER'${withCreatedAt ? ', NOW()' : ''})`,
        [userId],
      );
      return;
    }

    // Legacy lookup schema: users.role_id -> roles.id (with roles.name/role)
    if (usersCols.has('role_id') && rolesCols.has('id')) {
      const roleId = await this.ensureCustomerRoleId(rolesCols);
      if (roleId) {
        await this.db.executeRaw(
          `UPDATE users SET role_id = $1 WHERE id = $2`,
          [roleId, userId],
        );
        return;
      }
    }

    this.logger.warn(
      'Skipping default role persistence: no compatible users/roles schema mapping found',
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
      setFragments.push(`password_hash = $${param}`);
      values.push(passwordHash);
      param += 1;
    }
    if (usersCols.has('password')) {
      setFragments.push(`password = $${param}`);
      values.push(passwordHash);
      param += 1;
    }
    if (usersCols.has('updated_at')) {
      setFragments.push(`updated_at = NOW()`);
    }

    if (setFragments.length === 0) {
      throw new Error(
        "Users schema has neither 'password_hash' nor 'password' column",
      );
    }

    type Row = { id: string };
    const rows = await this.db.executeRaw<Row>(
      `UPDATE users
          SET ${setFragments.join(', ')}
        WHERE id = $${param}
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

    const nameExpr = this.buildNameExpression(usersCols, 'u');

    const statusExpr = usersCols.has('status')
      ? `COALESCE(NULLIF(u.status, ''), 'ACTIVE')`
      : `'ACTIVE'`;

    let passwordExpr = `NULL`;
    if (usersCols.has('password_hash') && usersCols.has('password')) {
      passwordExpr = `COALESCE(NULLIF(u.password_hash, ''), NULLIF(u.password, ''))`;
    } else if (usersCols.has('password_hash')) {
      passwordExpr = `NULLIF(u.password_hash, '')`;
    } else if (usersCols.has('password')) {
      passwordExpr = `NULLIF(u.password, '')`;
    }

    const joinClauses: string[] = [];
    if (rolesCols.has('user_id')) joinClauses.push(`r.user_id = u.id`);
    if (rolesCols.has('id') && usersCols.has('role_id')) {
      joinClauses.push(`r.id = u.role_id`);
    }
    const shouldJoinRoles = joinClauses.length > 0;

    const roleCandidates: string[] = [];
    if (shouldJoinRoles && rolesCols.has('role')) {
      roleCandidates.push(`NULLIF(r.role, '')`);
    }
    if (shouldJoinRoles && rolesCols.has('name')) {
      roleCandidates.push(`NULLIF(r.name, '')`);
    }
    const roleExpr =
      roleCandidates.length > 0
        ? `COALESCE(${roleCandidates.join(', ')}, 'CUSTOMER')`
        : `'CUSTOMER'`;

    const branchCandidates: string[] = [];
    if (shouldJoinRoles && rolesCols.has('branch_id')) {
      branchCandidates.push(`r.branch_id::text`);
    }
    if (usersCols.has('branch_id')) {
      branchCandidates.push(`u.branch_id::text`);
    }
    const branchExpr =
      branchCandidates.length > 0
        ? `COALESCE(${branchCandidates.join(', ')})`
        : `NULL`;

    let query = `
      SELECT
        u.id::text                 AS id,
        u.email                    AS email,
        ${nameExpr}                AS name,
        ${statusExpr}              AS status,
        ${passwordExpr}            AS password_hash,
        ${roleExpr}                AS role,
        ${branchExpr}              AS branch_id
      FROM users u
    `;

    if (shouldJoinRoles) {
      query += ` LEFT JOIN roles r ON (${joinClauses.join(' OR ')}) `;
    }

    query +=
      by === 'email'
        ? ` WHERE LOWER(u.email) = LOWER($1) `
        : ` WHERE u.id = $1 `;

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
    const col = (name: string) => (alias ? `${alias}.${name}` : name);
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
