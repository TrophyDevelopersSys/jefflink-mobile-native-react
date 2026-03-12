import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NOTIFICATIONS } from '../queue.module';

export interface NotificationJobData {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  pushToken?: string;
}

@Processor(QUEUE_NOTIFICATIONS)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  async process(job: Job<NotificationJobData>): Promise<void> {
    this.logger.debug(
      `Processing notification job ${job.id} for user ${job.data.userId}`,
    );

    if (job.data.pushToken) {
      await this.sendPushNotification(job.data);
    }
  }

  private async sendPushNotification(data: NotificationJobData): Promise<void> {
    // Integrate with Expo Push Notifications or FCM here.
    this.logger.debug(
      `Push notification: [${data.type}] ${data.title} → ${data.userId}`,
    );
  }
}
