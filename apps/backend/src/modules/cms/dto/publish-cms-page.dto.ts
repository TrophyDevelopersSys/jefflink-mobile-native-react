import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublishCmsPageDto {
  @ApiProperty({ enum: ['PUBLISHED', 'ARCHIVED'] })
  @IsIn(['PUBLISHED', 'ARCHIVED'])
  status!: 'PUBLISHED' | 'ARCHIVED';

  @ApiPropertyOptional({ description: 'Scheduled publish ISO timestamp' })
  @IsString()
  @IsOptional()
  publishAt?: string;
}
