import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../../database/database.service';
import { RedisService } from '../../redis/redis.service';
import { MailService } from '../mail/mail.service';

// ── Constants ────────────────────────────────────────────────────────────────

/** Recovery tokens expire after 15 minutes (900 seconds). */
const TOKEN_TTL_SECONDS = 900;

/** Max active (unused & unexpired) tokens per user to prevent abuse. */
const MAX_ACTIVE_TOKENS_PER_USER = 3;

/** Rate-limit key prefix for tracking per-email recovery requests. */
const RATE_LIMIT_PREFIX = 'admin_recovery_rate:';

/** Maximum recovery requests per email within the rate window. */
const RATE_LIMIT_MAX_REQUESTS = 3;

/** Rate window in seconds (15 minutes). */
const RATE_LIMIT_WINDOW_SECONDS = 900;

/** Admin roles eligible for this recovery flow. */
const ADMIN_ROLES = new Set([
  'SUPER_ADMIN',
  'ADMIN',
  'SYSTEM_ADMIN',
  'DIRECTOR',
]);

/** Audit action types */
type AuditAction =
  | 'REQUEST'
  | 'RESET_SUCCESS'
  | 'RESET_FAILED'
  | 'INITIATE'
  | 'REVOKE'
  | 'TOKEN_EXPIRED';

// ── Interfaces ───────────────────────────────────────────────────────────────

interface RequestContext {
  ipAddress?: string;
  userAgent?: string;
}

export interface RecoveryResult {
  message: string;
}

export interface AuditEntry {
  id: string;
  userId: string | null;
  action: string;
  email: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: unknown;
  initiatedBy: string | null;
  createdAt: string;
}

interface AdminUserRecord {
  id: string;
  email: string;
  name: string;
  role: string;
}

@Injectable()
export class AdminRecoveryService {
  private readonly logger = new Logger(AdminRecoveryService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // Self-Service Recovery Request
  // ═══════════════════════════════════════════════════════════════════════════

  async requestRecovery(
    email: string,
    ctx: RequestContext,
  ): Promise<RecoveryResult> {
    const normalised = email.toLowerCase().trim();

    // Rate-limit by email (Redis-backed)
    await this.enforceEmailRateLimit(normalised);

    try {
      const user = await this.findAdminByEmail(normalised);

      if (user) {
        await this.revokeActiveTokens(user.id);
        const rawToken = this.generateSecureToken();
        const tokenHash = this.hashToken(rawToken);
        const expiresAt = new Date(Date.now() + TOKEN_TTL_SECONDS * 1000);

        await this.storeRecoveryToken({
          userId: user.id,
          tokenHash,
          expiresAt,
          ipAddress: ctx.ipAddress,
          userAgent: ctx.userAgent,
          initiatedBy: null,
        });

        await this.writeAudit({
          userId: user.id,
          action: 'REQUEST',
          email: normalised,
          ipAddress: ctx.ipAddress,
          userAgent: ctx.userAgent,
          metadata: null,
          initiatedBy: null,
        });

        const resetUrl = this.buildRecoveryUrl(user.id, rawToken);
        const resendUrl = this.buildRecoveryRequestUrl(user.email);

        // In non-production with expose flag, return token for testing
        const exposeToken =
          this.config.get<string>('AUTH_EXPOSE_RESET_TOKEN') === 'true';
        if (exposeToken) {
          return {
            message: 'Recovery link generated (dev mode).',
            ...({ userId: user.id, token: rawToken, resetUrl, expiresInSeconds: TOKEN_TTL_SECONDS } as Record<string, unknown>),
          } as RecoveryResult;
        }

        const sent = await this.mail.sendAdminRecoveryEmail({
          to: user.email,
          name: user.name,
          resetUrl,
          resendUrl,
          expiresInMinutes: Math.floor(TOKEN_TTL_SECONDS / 60),
        });

        if (!sent) {
          this.logger.warn(
            `Admin recovery email could not be sent for ${normalised} — SMTP may not be configured`,
          );
        }
      } else {
        // Log attempt for unknown email without revealing whether the account exists
        await this.writeAudit({
          userId: null,
          action: 'REQUEST',
          email: normalised,
          ipAddress: ctx.ipAddress,
          userAgent: ctx.userAgent,
          metadata: { reason: 'email_not_found_or_not_admin' },
          initiatedBy: null,
        });
      }
    } catch (error) {
      // All errors are swallowed to prevent enumeration
      this.logger.error(
        `Admin recovery request failed for ${normalised}`,
        error instanceof Error ? error.stack : String(error),
      );
    }

    // Always return the same generic message to prevent email enumeration
    return {
      message:
        'If that email belongs to an admin account, a recovery link has been sent.',
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SUPER_ADMIN–Initiated Recovery
  // ═══════════════════════════════════════════════════════════════════════════

  async initiateRecovery(
    targetUserId: string,
    initiatorId: string,
    ctx: RequestContext,
  ): Promise<RecoveryResult> {
    // Verify the target is an admin
    const target = await this.findAdminById(targetUserId);
    if (!target) {
      throw new BadRequestException(
        'Target user not found or is not an admin account',
      );
    }

    // Prevent self-initiation (must use the self-service flow)
    if (target.id === initiatorId) {
      throw new BadRequestException(
        'Cannot initiate recovery for your own account. Use the self-service recovery flow.',
      );
    }

    await this.revokeActiveTokens(target.id);
    const rawToken = this.generateSecureToken();
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + TOKEN_TTL_SECONDS * 1000);

    await this.storeRecoveryToken({
      userId: target.id,
      tokenHash,
      expiresAt,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      initiatedBy: initiatorId,
    });

    await this.writeAudit({
      userId: target.id,
      action: 'INITIATE',
      email: target.email,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      metadata: { initiatorId },
      initiatedBy: initiatorId,
    });

    const resetUrl = this.buildRecoveryUrl(target.id, rawToken);
    const resendUrl = this.buildRecoveryRequestUrl(target.email);

    const sent = await this.mail.sendAdminRecoveryEmail({
      to: target.email,
      name: target.name,
      resetUrl,
      resendUrl,
      expiresInMinutes: Math.floor(TOKEN_TTL_SECONDS / 60),
      initiatedBy: initiatorId,
    });

    if (!sent) {
      this.logger.error(
        `Failed to send admin recovery email for user ${target.id} — SMTP may not be configured`,
      );
    }

    this.logger.log(
      `SUPER_ADMIN ${initiatorId} initiated recovery for admin ${target.id}`,
    );

    return { message: `Recovery email sent to ${this.maskEmail(target.email)}.` };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Reset Password with Recovery Token
  // ═══════════════════════════════════════════════════════════════════════════

  async resetPassword(
    userId: string,
    rawToken: string,
    newPassword: string,
    ctx: RequestContext,
  ): Promise<RecoveryResult> {
    const tokenHash = this.hashToken(rawToken);

    const tokenRecord = await this.findValidToken(userId, tokenHash);
    if (!tokenRecord) {
      await this.writeAudit({
        userId,
        action: 'RESET_FAILED',
        email: null,
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
        metadata: { reason: 'invalid_or_expired_token' },
        initiatedBy: null,
      });
      throw new BadRequestException('Recovery token is invalid or expired');
    }

    // Hash new password with bcrypt (12 salt rounds)
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Execute in a transaction: update password + mark token as used
    await this.db.withTransaction(async (client) => {
      // Update password
      await client.query(
        `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
        [passwordHash, userId],
      );

      // Mark token as used (single-use enforcement)
      await client.query(
        `UPDATE admin_recovery_tokens SET used_at = NOW() WHERE id = $1`,
        [tokenRecord.id],
      );

      // Revoke all other active tokens for this user
      await client.query(
        `UPDATE admin_recovery_tokens
         SET revoked_at = NOW()
         WHERE user_id = $1
           AND id != $2
           AND used_at IS NULL
           AND revoked_at IS NULL`,
        [userId, tokenRecord.id],
      );
    });

    // Invalidate any existing refresh tokens in Redis
    await this.redis.del(`refresh:${userId}`);

    await this.writeAudit({
      userId,
      action: 'RESET_SUCCESS',
      email: null,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      metadata: { tokenId: tokenRecord.id },
      initiatedBy: tokenRecord.initiatedBy,
    });

    this.logger.log(`Admin password reset completed for user ${userId}`);
    return {
      message: 'Password reset successful. Please log in with your new password.',
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Revoke All Active Tokens (SUPER_ADMIN action)
  // ═══════════════════════════════════════════════════════════════════════════

  async revokeTokens(
    targetUserId: string,
    initiatorId: string,
    ctx: RequestContext,
  ): Promise<RecoveryResult> {
    await this.revokeActiveTokens(targetUserId);

    await this.writeAudit({
      userId: targetUserId,
      action: 'REVOKE',
      email: null,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      metadata: { initiatorId },
      initiatedBy: initiatorId,
    });

    return { message: 'All active recovery tokens revoked.' };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Audit Log Query (SUPER_ADMIN only)
  // ═══════════════════════════════════════════════════════════════════════════

  async getAuditLog(query: {
    action?: string;
    page: number;
    limit: number;
  }): Promise<{ data: AuditEntry[]; total: number; page: number; limit: number }> {
    const offset = (query.page - 1) * query.limit;
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (query.action) {
      params.push(query.action);
      conditions.push(`action = $${params.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows, countRows] = await Promise.all([
      this.db.executeRaw<AuditEntry>(
        `SELECT id, user_id AS "userId", action, email, ip_address AS "ipAddress",
                user_agent AS "userAgent", metadata, initiated_by AS "initiatedBy",
                created_at AS "createdAt"
         FROM admin_recovery_audit
         ${where}
         ORDER BY created_at DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, query.limit, offset],
      ),
      this.db.executeRaw<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM admin_recovery_audit ${where}`,
        params,
      ),
    ]);

    // Mask emails in the response
    const maskedRows = rows.map((row) => ({
      ...row,
      email: row.email ? this.maskEmail(row.email) : null,
    }));

    return {
      data: maskedRows,
      total: parseInt(countRows[0]?.count ?? '0', 10),
      page: query.page,
      limit: query.limit,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Expired Token Cleanup (called periodically or on-demand)
  // ═══════════════════════════════════════════════════════════════════════════

  async cleanupExpiredTokens(): Promise<{ cleaned: number }> {
    const rows = await this.db.executeRaw<{ count: string }>(
      `WITH deleted AS (
         DELETE FROM admin_recovery_tokens
         WHERE expires_at < NOW()
           AND used_at IS NULL
           AND revoked_at IS NULL
         RETURNING id
       )
       SELECT COUNT(*)::text AS count FROM deleted`,
    );
    const cleaned = parseInt(rows[0]?.count ?? '0', 10);
    if (cleaned > 0) {
      this.logger.log(`Cleaned up ${cleaned} expired admin recovery tokens`);
    }
    return { cleaned };
  }

  // ── Private Helpers ────────────────────────────────────────────────────────

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * SHA-256 hash for token comparison.
   * SHA-256 is appropriate here (vs bcrypt) because the input is already
   * a high-entropy 256-bit random token — dictionary/rainbow attacks are
   * infeasible. SHA-256 allows O(1) indexed lookups in the database.
   */
  private hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  private async findAdminByEmail(email: string): Promise<AdminUserRecord | null> {
    const rows = await this.db.executeRaw<AdminUserRecord>(
      `SELECT u.id::text AS id, u.email, u.name,
              COALESCE(r.role, u.role, 'CUSTOMER') AS role
       FROM users u
       LEFT JOIN roles r ON r.user_id = u.id
       WHERE u.email = $1
         AND u.status = 'ACTIVE'
       LIMIT 1`,
      [email],
    );

    const user = rows[0];
    if (!user || !ADMIN_ROLES.has(user.role)) return null;
    return user;
  }

  private async findAdminById(userId: string): Promise<AdminUserRecord | null> {
    const rows = await this.db.executeRaw<AdminUserRecord>(
      `SELECT u.id::text AS id, u.email, u.name,
              COALESCE(r.role, u.role, 'CUSTOMER') AS role
       FROM users u
       LEFT JOIN roles r ON r.user_id = u.id
       WHERE u.id = $1
         AND u.status = 'ACTIVE'
       LIMIT 1`,
      [userId],
    );

    const user = rows[0];
    if (!user || !ADMIN_ROLES.has(user.role)) return null;
    return user;
  }

  private async storeRecoveryToken(params: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
    initiatedBy: string | null;
  }): Promise<void> {
    // Enforce max active tokens per user
    const activeCount = await this.db.executeRaw<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM admin_recovery_tokens
       WHERE user_id = $1
         AND expires_at > NOW()
         AND used_at IS NULL
         AND revoked_at IS NULL`,
      [params.userId],
    );

    if (parseInt(activeCount[0]?.count ?? '0', 10) >= MAX_ACTIVE_TOKENS_PER_USER) {
      // Revoke oldest tokens to make room
      await this.db.executeRaw(
        `UPDATE admin_recovery_tokens
         SET revoked_at = NOW()
         WHERE user_id = $1
           AND used_at IS NULL
           AND revoked_at IS NULL
           AND expires_at > NOW()`,
        [params.userId],
      );
    }

    await this.db.executeRaw(
      `INSERT INTO admin_recovery_tokens
         (user_id, token_hash, expires_at, ip_address, user_agent, initiated_by)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        params.userId,
        params.tokenHash,
        params.expiresAt,
        params.ipAddress ?? null,
        params.userAgent ?? null,
        params.initiatedBy,
      ],
    );
  }

  private async findValidToken(
    userId: string,
    tokenHash: string,
  ): Promise<{ id: string; initiatedBy: string | null } | null> {
    const rows = await this.db.executeRaw<{
      id: string;
      initiatedBy: string | null;
    }>(
      `SELECT id::text AS id, initiated_by AS "initiatedBy"
       FROM admin_recovery_tokens
       WHERE user_id = $1
         AND token_hash = $2
         AND expires_at > NOW()
         AND used_at IS NULL
         AND revoked_at IS NULL
       LIMIT 1`,
      [userId, tokenHash],
    );  
    return rows[0] ?? null;
  }

  private async revokeActiveTokens(userId: string): Promise<void> {
    await this.db.executeRaw(
      `UPDATE admin_recovery_tokens
       SET revoked_at = NOW()
       WHERE user_id = $1
         AND used_at IS NULL
         AND revoked_at IS NULL`,
      [userId],
    );
  }

  private async writeAudit(entry: {
    userId: string | null;
    action: AuditAction;
    email: string | null;
    ipAddress?: string;
    userAgent?: string;
    metadata: unknown;
    initiatedBy: string | null;
  }): Promise<void> {
    try {
      await this.db.executeRaw(
        `INSERT INTO admin_recovery_audit
           (user_id, action, email, ip_address, user_agent, metadata, initiated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          entry.userId,
          entry.action,
          entry.email,
          entry.ipAddress ?? null,
          entry.userAgent ?? null,
          entry.metadata ? JSON.stringify(entry.metadata) : null,
          entry.initiatedBy,
        ],
      );
    } catch (error) {
      // Audit writes must not crash the recovery flow
      this.logger.error(
        `Failed to write admin recovery audit log`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private async enforceEmailRateLimit(email: string): Promise<void> {
    const key = `${RATE_LIMIT_PREFIX}${email}`;
    const count = await this.redis.increment(key);

    if (count === 1) {
      // First hit — set the TTL
      await this.redis.expire(key, RATE_LIMIT_WINDOW_SECONDS);
    }

    if (count > RATE_LIMIT_MAX_REQUESTS) {
      throw new BadRequestException(
        'Too many recovery requests. Please wait before trying again.',
      );
    }
  }

  private buildRecoveryUrl(userId: string, token: string): string {
    const webBase = this.getSanitizedWebBaseUrl();
    return `${webBase}/admin-recovery/reset?uid=${encodeURIComponent(
      userId,
    )}&token=${encodeURIComponent(token)}`;
  }

  private buildRecoveryRequestUrl(email: string): string {
    const webBase = this.getSanitizedWebBaseUrl();
    return `${webBase}/admin-recovery?email=${encodeURIComponent(email)}`;
  }

  private getSanitizedWebBaseUrl(): string {
    const webBase =
      this.config.get<string>('WEB_APP_URL') ??
      this.config.get<string>('NEXT_PUBLIC_SITE_URL') ??
      'https://jefflinkcars.com';
    return webBase.replace(/\/+$/, '');
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) return '***@***';
    const visible = local.length <= 2 ? local[0] : local.slice(0, 2);
    return `${visible}${'*'.repeat(Math.max(local.length - 2, 1))}@${domain}`;
  }
}
