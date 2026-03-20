import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminRecoveryRequestDto {
  @ApiProperty({ description: 'Email of the admin account to recover' })
  @IsEmail()
  email!: string;
}
