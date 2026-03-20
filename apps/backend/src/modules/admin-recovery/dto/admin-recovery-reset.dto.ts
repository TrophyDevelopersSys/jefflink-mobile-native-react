import { IsString, MinLength, MaxLength, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminRecoveryResetDto {
  @ApiProperty({ description: 'User ID from recovery link' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ description: 'Raw recovery token from link' })
  @IsString()
  @MinLength(16)
  @MaxLength(512)
  token!: string;

  @ApiProperty({ description: 'New account password', minLength: 10 })
  @IsString()
  @MinLength(10)
  @MaxLength(72)
  newPassword!: string;
}
