import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MulterModule } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { QUEUE_MEDIA } from '../../queue/queue.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUE_MEDIA }),
    MulterModule.register({ limits: { fileSize: 50 * 1024 * 1024 } }),
  ],
  providers: [MediaService],
  controllers: [MediaController],
  exports: [MediaService],
})
export class MediaModule {}
