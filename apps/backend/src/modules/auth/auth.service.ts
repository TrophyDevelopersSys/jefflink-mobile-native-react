import {
  Injectable,
  UnauthorizedException,
  ConflictException,
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

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private schemaColumnsCache:
    | {
        users: Set<string>;
        roles: Set<string>;
      }
    | undefined;

  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens> {
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

    const [user] = await this.db.db
      .insert(users)
      .values({
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name,
        phone: dto.phone,
        status: 'ACTIVE',
      })
      .returning({ id: users.id, email: users.email, name: users.name });

    // Assign default CUSTOMER role
    await this.db.db.insert(roles).values({
      userId: user.id,
      role: 'CUSTOMER',
    });

    return this.issueTokens({ sub: user.id, email: user.email, name: user.name, role: 'CUSTOMER' });
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
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
  async forgotPassword(email: string): Promise<{ message: string }> {
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
      await this.redis.set(`reset:${result[0].id}`, tokenHash, 3600);
      this.logger.log(`Password reset token generated for user ${result[0].id}`);
      // TODO: dispatch email with reset link once MailerService is integrated
    }

    // Always return the same message to prevent email enumeration
    return { message: 'If that email is registered you will receive a reset link shortly.' };
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

  private normalizeRole(role: string | null | undefined): AppRole {
    const value = (role ?? '').toUpperCase();
    if (value === 'ADMIN' || value === 'VENDOR' || value === 'CUSTOMER') {
      return value;
    }
    return 'CUSTOMER';
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

    const nameCandidates: string[] = [];
    if (usersCols.has('name')) {
      nameCandidates.push(`NULLIF(u.name, '')`);
    }
    if (usersCols.has('first_name') || usersCols.has('last_name')) {
      nameCandidates.push(
        `NULLIF(TRIM(COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '')), '')`,
      );
    }
    nameCandidates.push(`SPLIT_PART(u.email, '@', 1)`);
    const nameExpr = `COALESCE(${nameCandidates.join(', ')})`;

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
