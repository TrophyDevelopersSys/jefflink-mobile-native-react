import { IsOptional, IsIn, IsBoolean, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryCmsPageDto {
  @ApiPropertyOptional({ enum: ['ALL', 'MOBILE', 'WEB'] })
  @IsIn(['ALL', 'MOBILE', 'WEB'])
  @IsOptional()
  platform?: 'ALL' | 'MOBILE' | 'WEB';

  @ApiPropertyOptional({ example: 'en' })
  @IsString()
  @IsOptional()
  locale?: string;

  @ApiPropertyOptional({ description: 'If true, returns DRAFT pages', default: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  preview?: boolean;
}
