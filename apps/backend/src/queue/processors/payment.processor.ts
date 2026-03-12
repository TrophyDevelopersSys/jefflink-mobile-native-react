import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_PAYMENTS } from '../queue.module';

export interface PaymentJobData {
  type: 'reconcile' | 'penalty-sweep' | 'analytics';
  payload: Record<string, unknown>;
}

@Processor(QUEUE_PAYMENTS)
export class PaymentProcessor extends WorkerHost {
  private readonly logger = new Logger(PaymentProcessor.name);

  async process(job: Job<PaymentJobData>): Promise<void> {
    this.logger.debug(
      `Processing payment job ${job.id}: ${job.data.type}`,
    );

    switch (job.data.type) {
      case 'reconcile':
        await this.handleReconciliation(job.data.payload);
        break;
      case 'penalty-sweep':
        await this.handlePenaltySweep(job.data.payload);
        break;
      case 'analytics':
        await this.handleAnalytics(job.data.payload);
        break;
    }
  }

  private async handleReconciliation(payload: Record<string, unknown>): Promise<void> {
    this.logger.debug('Payment reconciliation task', payload);
  }

  private async handlePenaltySweep(payload: Record<string, unknown>): Promise<void> {
    this.logger.debug('Penalty sweep task', payload);
  }

  private async handleAnalytics(payload: Record<string, unknown>): Promise<void> {
    this.logger.debug('Analytics aggregation task', payload);
  }
}
