import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePropertyDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({ enum: ['house', 'land', 'apartment', 'commercial'] })
  @IsOptional()
  @IsEnum(['house', 'land', 'apartment', 'commercial'])
  propertyType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  bedrooms?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sizeM2?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdatePropertyDto extends CreatePropertyDto {
  @ApiPropertyOptional({ enum: ['AVAILABLE', 'SOLD', 'RESERVED', 'INACTIVE'] })
  @IsOptional()
  @IsEnum(['AVAILABLE', 'SOLD', 'RESERVED', 'INACTIVE'])
  status?: string;
}
