import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsUrl, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSliderDto {
  @ApiProperty({ example: 'Find Your Dream Car' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Affordable cars across Uganda' })
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiProperty({ example: 'https://cdn.jefflinkcars.com/cms/sliders/hero1.jpg' })
  @IsString()
  @IsNotEmpty()
  imageUrl!: string;

  @ApiPropertyOptional({ example: 'Browse Cars' })
  @IsString()
  @IsOptional()
  buttonLabel?: string;

  @ApiPropertyOptional({ example: '/cars' })
  @IsString()
  @IsOptional()
  buttonLink?: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
