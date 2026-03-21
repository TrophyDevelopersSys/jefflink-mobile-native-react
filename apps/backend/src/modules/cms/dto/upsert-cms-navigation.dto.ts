import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CmsNavigationItemDto {
  @ApiProperty({ example: 'Home' })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiProperty({ example: '/' })
  @IsString()
  @IsNotEmpty()
  href!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ type: [CmsNavigationItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CmsNavigationItemDto)
  @IsOptional()
  children?: CmsNavigationItemDto[];
}

export class UpsertCmsNavigationDto {
  @ApiProperty({ example: 'main_nav' })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty({ enum: ['ALL', 'MOBILE', 'WEB'] })
  @IsIn(['ALL', 'MOBILE', 'WEB'])
  platform!: 'ALL' | 'MOBILE' | 'WEB';

  @ApiProperty({ type: [CmsNavigationItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CmsNavigationItemDto)
  items!: CmsNavigationItemDto[];
}
