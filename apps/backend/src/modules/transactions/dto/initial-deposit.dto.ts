import { IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InitialDepositDto {
  @ApiProperty({ description: 'Deposit amount', example: 5000000 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({ description: 'Payment method (MOBILE_MONEY, CASH, BANK_TRANSFER)', example: 'MOBILE_MONEY' })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional({ description: 'MoMo / external transaction ID for reconciliation' })
  @IsString()
  @IsOptional()
  momoTransactionId?: string;

  @ApiPropertyOptional({ description: 'Idempotency key to prevent duplicate submissions' })
  @IsString()
  @IsOptional()
  idempotencyKey?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
