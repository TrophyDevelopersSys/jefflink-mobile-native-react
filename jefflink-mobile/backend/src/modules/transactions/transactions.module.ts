import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { QUEUE_PAYMENTS } from '../../queue/queue.module';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_PAYMENTS })],
  providers: [TransactionsService],
  controllers: [TransactionsController],
  exports: [TransactionsService],
})
export class TransactionsModule {}
