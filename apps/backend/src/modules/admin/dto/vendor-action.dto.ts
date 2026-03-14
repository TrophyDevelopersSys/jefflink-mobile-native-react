import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class VerifyVendorDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class SuspendVendorDto {
  @ApiProperty({ description: 'Reason for suspension' })
  @IsString()
  @MaxLength(1000)
  reason!: string;
}
