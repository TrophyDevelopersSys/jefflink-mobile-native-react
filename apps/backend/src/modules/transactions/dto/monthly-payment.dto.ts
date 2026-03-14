import { IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MonthlyPaymentDto {
  @ApiProperty({ description: 'Amount paid (must be >= installment amount)', example: 1200000 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({ description: 'Payment method', example: 'MOBILE_MONEY' })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional({ description: 'MoMo / external transaction ID' })
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
