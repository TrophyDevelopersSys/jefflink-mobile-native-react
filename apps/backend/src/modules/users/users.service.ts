import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { RedisService } from '../../redis/redis.service';
import { users, roles } from '../../database/schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  async findById(id: string) {
    const ttl = this.config.get<number>('app.cacheTtlProfile', 600);

    return this.redis.remember(`user:${id}`, ttl, async () => {
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
        .where(eq(users.id, id))
        .limit(1);

      if (!result[0]) throw new NotFoundException('User not found');
      return result[0];
    });
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<void> {
    await this.db.db
      .update(users)
      .set({ avatarUrl, updatedAt: new Date() })
      .where(eq(users.id, userId));

    await this.redis.del(`user:${userId}`);
  }

  async listAll(limit = 50, offset = 0) {
    return this.db.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        phone: users.phone,
        status: users.status,
        role: roles.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(roles, eq(roles.userId, users.id))
      .limit(limit)
      .offset(offset);
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.db.db
      .update(users)
      .set({ status, updatedAt: new Date() })
      .where(eq(users.id, id));
    await this.redis.del(`user:${id}`);
  }
}
