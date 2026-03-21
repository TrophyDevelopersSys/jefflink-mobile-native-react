import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ── Nested layout DTOs ─────────────────────────────────────────────────────

class CmsSliderItemDto {
  @IsString() @IsNotEmpty() id!: string;
  @IsString() @IsNotEmpty() title!: string;
  @IsString() @IsOptional() subtitle?: string;
  @IsString() @IsNotEmpty() imageUrl!: string;
  @IsString() @IsOptional() buttonLabel?: string;
  @IsString() @IsOptional() buttonLink?: string;
  @IsOptional() sortOrder?: number;
}

class CmsBannerItemDto {
  @IsString() @IsNotEmpty() id!: string;
  @IsString() @IsNotEmpty() imageUrl!: string;
  @IsString() @IsOptional() link?: string;
  @IsString() @IsOptional() alt?: string;
}

class CmsContentBlockDto {
  @IsString() @IsNotEmpty() id!: string;
  @IsString() @IsNotEmpty() key!: string;
  @IsString() @IsNotEmpty() value!: string;
  @IsIn(['text', 'html', 'json', 'url']) @IsOptional() type?: string;
  @IsString() @IsOptional() description?: string;
}

class CmsListBlockDto {
  @IsString() @IsNotEmpty() id!: string;
  @IsString() @IsNotEmpty() title!: string;
  @IsString() @IsOptional() listingType?: string;
  @IsObject() @IsOptional() query?: Record<string, unknown>;
  @IsOptional() limit?: number;
}

export class CmsLayoutDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => CmsBannerItemDto) @IsOptional()
  header?: CmsBannerItemDto[];

  @IsArray() @ValidateNested({ each: true }) @Type(() => CmsSliderItemDto) @IsOptional()
  slider?: CmsSliderItemDto[];

  @IsArray() @ValidateNested({ each: true }) @Type(() => CmsContentBlockDto) @IsOptional()
  body?: CmsContentBlockDto[];

  @IsArray() @ValidateNested({ each: true }) @Type(() => CmsListBlockDto) @IsOptional()
  lists?: CmsListBlockDto[];
}

class CmsSeoDto {
  @IsString() @IsOptional() title?: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() imageUrl?: string;
}

// ── Main DTO ───────────────────────────────────────────────────────────────

export class CreateCmsPageDto {
  @ApiProperty({ example: 'homepage' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ enum: ['ALL', 'MOBILE', 'WEB'], example: 'ALL' })
  @IsIn(['ALL', 'MOBILE', 'WEB'])
  platform!: 'ALL' | 'MOBILE' | 'WEB';

  @ApiPropertyOptional({ example: 'en' })
  @IsString()
  @IsOptional()
  locale?: string;

  @ApiProperty({ example: 'Homepage' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ type: CmsLayoutDto })
  @ValidateNested()
  @Type(() => CmsLayoutDto)
  layout!: CmsLayoutDto;

  @ApiPropertyOptional({ type: CmsSeoDto })
  @ValidateNested()
  @Type(() => CmsSeoDto)
  @IsOptional()
  seo?: CmsSeoDto;

  @ApiPropertyOptional({ enum: ['DRAFT', 'PUBLISHED'], default: 'DRAFT' })
  @IsIn(['DRAFT', 'PUBLISHED'])
  @IsOptional()
  status?: 'DRAFT' | 'PUBLISHED';
}
