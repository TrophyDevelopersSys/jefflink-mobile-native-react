import { IsString, MinLength, MaxLength, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'User ID from reset link' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ description: 'Raw reset token from reset link' })
  @IsString()
  @MinLength(16)
  @MaxLength(512)
  token!: string;

  @ApiProperty({ description: 'New account password', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  newPassword!: string;
}
