import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpsertContentDto {
  @ApiProperty({ example: 'homepage_hero_title' })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty({ example: 'Find Your Dream Car' })
  @IsString()
  @IsNotEmpty()
  value!: string;

  @ApiPropertyOptional({ example: 'text', enum: ['text', 'html', 'json', 'url'] })
  @IsIn(['text', 'html', 'json', 'url'])
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ example: 'Main heading on the homepage hero section' })
  @IsString()
  @IsOptional()
  description?: string;
}
