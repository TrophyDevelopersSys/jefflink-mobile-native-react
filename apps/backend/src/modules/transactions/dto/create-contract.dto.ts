import { IsUUID, IsOptional, IsNumber, IsPositive, Min, Max, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContractDto {
  @ApiPropertyOptional({ description: 'Vehicle ID (mutually exclusive with propertyId)' })
  @IsUUID()
  @IsOptional()
  vehicleId?: string;

  @ApiPropertyOptional({ description: 'Property ID (mutually exclusive with vehicleId)' })
  @IsUUID()
  @IsOptional()
  propertyId?: string;

  @ApiProperty({ description: 'Total hire-purchase price', example: 25000000 })
  @IsNumber()
  @IsPositive()
  totalAmount: number;

  @ApiProperty({ description: 'Initial deposit / down payment', example: 5000000 })
  @IsNumber()
  @IsPositive()
  initialDeposit: number;

  @ApiProperty({ description: 'Annual interest rate as a decimal (e.g. 0.18 for 18%)', example: 0.18 })
  @IsNumber()
  @Min(0)
  @Max(1)
  interestRate: number;

  @ApiProperty({ description: 'Repayment term in months', example: 24 })
  @IsNumber()
  @IsPositive()
  @Max(360)
  termMonths: number;

  @ApiPropertyOptional({ description: 'ISO currency code', example: 'UGX' })
  @IsString()
  @IsOptional()
  currency?: string;
}
