import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { QUEUE_NOTIFICATIONS } from '../../queue/queue.module';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_NOTIFICATIONS })],
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
