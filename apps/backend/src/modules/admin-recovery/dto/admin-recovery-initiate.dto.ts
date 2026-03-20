import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminRecoveryInitiateDto {
  @ApiProperty({ description: 'User ID of the admin account to recover' })
  @IsUUID()
  userId!: string;
}
