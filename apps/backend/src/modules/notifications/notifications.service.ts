import { Injectable, Optional, Logger } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DatabaseService } from '../../database/database.service';
import { notifications } from '../../database/schema';
import { QUEUE_NOTIFICATIONS } from '../../queue/queue.module';

export interface SendNotificationPayload {
  userId: string;
  title: string;
  body: string;
  type?: string;
  data?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly db: DatabaseService,
    @Optional() @InjectQueue(QUEUE_NOTIFICATIONS) private readonly notifQueue: Queue | null,
  ) {}

  async findAll(userId: string) {
    return this.db.db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async markRead(notificationId: string, userId: string) {
    await this.db.db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() } as any)
      .where(
        eq(notifications.id, notificationId),
      );
  }

  async markAllRead(userId: string) {
    await this.db.db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() } as any)
      .where(eq(notifications.userId, userId));
  }

  async send(payload: SendNotificationPayload) {
    // Persist notification
    await this.db.db.insert(notifications).values({
      userId: payload.userId,
      title: payload.title,
      body: payload.body,
      type: payload.type ?? 'GENERAL',
      data: payload.data ?? {},
    });

    // Dispatch push notification via BullMQ (no-op when Redis is unavailable)
    if (!this.notifQueue) return;

    try {
      await this.notifQueue.add('push', {
        type: 'push',
        payload,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to enqueue notification job (continuing without queue): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
