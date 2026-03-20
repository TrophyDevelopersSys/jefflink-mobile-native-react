import { Module } from '@nestjs/common';
import { AdminRecoveryController } from './admin-recovery.controller';
import { AdminRecoveryService } from './admin-recovery.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [AdminRecoveryController],
  providers: [AdminRecoveryService],
  exports: [AdminRecoveryService],
})
export class AdminRecoveryModule {}
