import { IsOptional, IsString, IsIn, MaxLength } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class ApproveListingDto {
  @ApiPropertyOptional({ description: 'Optional moderator note' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

export class RejectListingDto {
  @ApiProperty({ description: 'Reason for rejection shown to vendor' })
  @IsString()
  @MaxLength(1000)
  reason!: string;
}
