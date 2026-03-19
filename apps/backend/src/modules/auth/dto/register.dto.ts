import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

function normalizeString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  }
  return undefined;
}

export class RegisterDto {
  @ApiProperty({ example: 'john@example.com' })
  @Transform(({ value }) => normalizeString(value)?.toLowerCase())
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Preferred display name' })
  @Transform(({ value }) => normalizeString(value))
  @ValidateIf((o: RegisterDto) => !o.fullName)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Backward-compatible alias for name',
  })
  @Transform(({ value }) => normalizeString(value))
  @ValidateIf((o: RegisterDto) => !o.name)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName?: string;

  @ApiPropertyOptional({ example: '+256701234567' })
  @Transform(({ value }) => normalizeString(value))
  @IsOptional()
  @IsString()
  @MinLength(9)
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    example: 'VENDOR',
    description: 'Optional registration role hint; public registration supports CUSTOMER and VENDOR',
  })
  @Transform(({ value }) => normalizeString(value)?.toUpperCase())
  @IsOptional()
  @IsString()
  @MaxLength(50)
  role?: string;

  @ApiPropertyOptional({ example: false, description: 'Dealer registration shortcut flag' })
  @Transform(({ value }) => normalizeBoolean(value))
  @IsOptional()
  @IsBoolean()
  isDealer?: boolean;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}
