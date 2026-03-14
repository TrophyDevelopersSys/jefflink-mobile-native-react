import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserStatusDto {
  @ApiProperty({ enum: ['ACTIVE', 'SUSPENDED', 'BANNED'] })
  @IsIn(['ACTIVE', 'SUSPENDED', 'BANNED'])
  status!: 'ACTIVE' | 'SUSPENDED' | 'BANNED';

  @ApiPropertyOptional({ description: 'Reason visible in audit log' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
