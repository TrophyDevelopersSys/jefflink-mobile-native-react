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

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

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
    // Fetch user with associated role
    const result = await this.db.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        passwordHash: users.passwordHash,
        status: users.status,
        role: roles.role,
        branchId: roles.branchId,
      })
      .from(users)
      .leftJoin(roles, eq(roles.userId, users.id))
      .where(eq(users.email, dto.email.toLowerCase()))
      .limit(1);

    if (result.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const record = result[0];

    if (record.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    if (!record.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, record.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: AuthUser = {
      sub: record.id,
      email: record.email,
      name: record.name,
      role: (record.role ?? 'CUSTOMER') as AppRole,
      branchId: record.branchId ?? undefined,
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

    // Re-fetch user to get latest role
    const result = await this.db.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        status: users.status,
        role: roles.role,
        branchId: roles.branchId,
      })
      .from(users)
      .leftJoin(roles, eq(roles.userId, users.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (!result[0] || result[0].status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is no longer active');
    }

    const r = result[0];
    return this.issueTokens({
      sub: r.id,
      email: r.email,
      name: r.name,
      role: (r.role ?? 'CUSTOMER') as AppRole,
      branchId: r.branchId ?? undefined,
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
    const result = await this.db.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        phone: users.phone,
        avatarUrl: users.avatarUrl,
        status: users.status,
        role: roles.role,
        branchId: roles.branchId,
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(roles, eq(roles.userId, users.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (!result[0]) {
      throw new UnauthorizedException('User not found');
    }

    const u = result[0];
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: (u.role ?? 'CUSTOMER') as AppRole,
      branchId: u.branchId ?? undefined,
    };
  }

  // ── Private helpers ────────────────────────────────────────────────────────

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
