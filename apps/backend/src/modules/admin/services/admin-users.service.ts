import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, desc, ilike, or, sql } from 'drizzle-orm';
import { DatabaseService } from '../../../database/database.service';
import { users, roles, vendorProfiles } from '../../../database/schema';
import type { AuditActor } from './audit-log.service';
import { AuditLogService } from './audit-log.service';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditLogService,
  ) {}

  async listUsers(page = 1, limit = 20, search?: string) {
    const offset = (page - 1) * limit;

    const query = this.db.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        phone: users.phone,
        status: users.status,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    if (search) {
      return this.db.db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          phone: users.phone,
          status: users.status,
          avatarUrl: users.avatarUrl,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(
          or(
            ilike(users.email, `%${search}%`),
            ilike(users.name, `%${search}%`),
            ilike(users.phone ?? '', `%${search}%`),
          ),
        )
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);
    }

    return query;
  }

  async getUserById(id: string) {
    const [user] = await this.db.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) throw new NotFoundException(`User ${id} not found`);

    const userRoles = await this.db.db
      .select({ role: roles.role })
      .from(roles)
      .where(eq(roles.userId, id));

    const [profile] = await this.db.db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.userId, id))
      .limit(1);

    return { ...user, roles: userRoles.map((r) => r.role), vendorProfile: profile ?? null };
  }

  async updateUserStatus(
    actor: AuditActor,
    userId: string,
    status: UserStatus,
  ) {
    const [existing] = await this.db.db
      .select({ id: users.id, status: users.status })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!existing) throw new NotFoundException(`User ${userId} not found`);

    await this.db.db
      .update(users)
      .set({ status, updatedAt: new Date() })
      .where(eq(users.id, userId));

    await this.audit.log(actor, `${status}_USER`, 'user', userId, {
      before: { status: existing.status },
      after: { status },
    });

    return { id: userId, status };
  }

  async getUserCount(): Promise<number> {
    const [row] = await this.db.db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    return Number(row?.count ?? 0);
  }
}
