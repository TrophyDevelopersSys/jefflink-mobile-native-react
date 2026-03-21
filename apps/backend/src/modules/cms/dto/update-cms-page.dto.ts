import { PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateCmsPageDto } from './create-cms-page.dto';

export class UpdateCmsPageDto extends PartialType(CreateCmsPageDto) {
  @ApiPropertyOptional({ description: 'Optimistic concurrency version' })
  @IsInt()
  @Min(1)
  @IsOptional()
  expectedVersion?: number;
}
