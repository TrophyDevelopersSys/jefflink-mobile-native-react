import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsArray,
  IsInt,
  IsNumber,
  ValidateNested,
  IsObject,
  Min,
  Max,
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

class CmsHeroBlockDto {
  @IsString() @IsNotEmpty() id!: string;
  @IsString() @IsNotEmpty() heading!: string;
  @IsString() @IsOptional() subheading?: string;
  @IsString() @IsOptional() backgroundImageUrl?: string;
  @IsString() @IsOptional() ctaLabel?: string;
  @IsString() @IsOptional() ctaLink?: string;
  @IsIn(['left', 'center', 'right']) @IsOptional() alignment?: string;
}

class CmsTextBlockDto {
  @IsString() @IsNotEmpty() id!: string;
  @IsString() @IsNotEmpty() content!: string;
  @IsIn(['plain', 'html', 'markdown']) format!: string;
}

class CmsImageBlockDto {
  @IsString() @IsNotEmpty() id!: string;
  @IsString() @IsNotEmpty() imageUrl!: string;
  @IsString() @IsOptional() alt?: string;
  @IsString() @IsOptional() caption?: string;
  @IsNumber() @IsOptional() width?: number;
  @IsNumber() @IsOptional() height?: number;
}

class CmsCtaBlockDto {
  @IsString() @IsNotEmpty() id!: string;
  @IsString() @IsNotEmpty() heading!: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsNotEmpty() buttonLabel!: string;
  @IsString() @IsNotEmpty() buttonLink!: string;
  @IsIn(['primary', 'secondary', 'outline']) @IsOptional() variant?: string;
}

class CmsStatsItemDto {
  @IsString() @IsNotEmpty() label!: string;
  @IsString() @IsNotEmpty() value!: string;
  @IsString() @IsOptional() icon?: string;
}

class CmsStatsBlockDto {
  @IsString() @IsNotEmpty() id!: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => CmsStatsItemDto)
  items!: CmsStatsItemDto[];
}

class CmsTestimonialItemDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsString() @IsOptional() role?: string;
  @IsString() @IsNotEmpty() quote!: string;
  @IsString() @IsOptional() avatarUrl?: string;
  @IsInt() @Min(1) @Max(5) @IsOptional() rating?: number;
}

class CmsTestimonialsBlockDto {
  @IsString() @IsNotEmpty() id!: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => CmsTestimonialItemDto)
  items!: CmsTestimonialItemDto[];
}

class CmsFaqItemDto {
  @IsString() @IsNotEmpty() question!: string;
  @IsString() @IsNotEmpty() answer!: string;
}

class CmsFaqBlockDto {
  @IsString() @IsNotEmpty() id!: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => CmsFaqItemDto)
  items!: CmsFaqItemDto[];
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

  @IsArray() @ValidateNested({ each: true }) @Type(() => CmsHeroBlockDto) @IsOptional()
  hero?: CmsHeroBlockDto[];

  @IsArray() @ValidateNested({ each: true }) @Type(() => CmsTextBlockDto) @IsOptional()
  textBlocks?: CmsTextBlockDto[];

  @IsArray() @ValidateNested({ each: true }) @Type(() => CmsImageBlockDto) @IsOptional()
  images?: CmsImageBlockDto[];

  @IsArray() @ValidateNested({ each: true }) @Type(() => CmsCtaBlockDto) @IsOptional()
  cta?: CmsCtaBlockDto[];

  @IsArray() @ValidateNested({ each: true }) @Type(() => CmsStatsBlockDto) @IsOptional()
  stats?: CmsStatsBlockDto[];

  @IsArray() @ValidateNested({ each: true }) @Type(() => CmsTestimonialsBlockDto) @IsOptional()
  testimonials?: CmsTestimonialsBlockDto[];

  @IsArray() @ValidateNested({ each: true }) @Type(() => CmsFaqBlockDto) @IsOptional()
  faq?: CmsFaqBlockDto[];
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
