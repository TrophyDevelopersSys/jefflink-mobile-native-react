import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_MEDIA } from '../queue.module';

export interface MediaJobData {
  mediaId: string;
  bucket: string;
  key: string;
  operation: 'compress' | 'thumbnail' | 'delete';
}

@Processor(QUEUE_MEDIA)
export class MediaProcessor extends WorkerHost {
  private readonly logger = new Logger(MediaProcessor.name);

  async process(job: Job<MediaJobData>): Promise<void> {
    this.logger.debug(`Processing media job ${job.id}: ${job.data.operation}`);

    switch (job.data.operation) {
      case 'compress':
        await this.handleCompress(job.data);
        break;
      case 'thumbnail':
        await this.handleThumbnail(job.data);
        break;
      case 'delete':
        await this.handleDelete(job.data);
        break;
    }
  }

  private async handleCompress(data: MediaJobData): Promise<void> {
    // Image compression via sharp is handled at upload time in MediaService.
    // This worker handles async re-processing if needed.
    this.logger.debug(`Compress task for key: ${data.key}`);
  }

  private async handleThumbnail(data: MediaJobData): Promise<void> {
    this.logger.debug(`Thumbnail generation for key: ${data.key}`);
  }

  private async handleDelete(data: MediaJobData): Promise<void> {
    this.logger.debug(`Delete task for key: ${data.key}`);
  }
}
