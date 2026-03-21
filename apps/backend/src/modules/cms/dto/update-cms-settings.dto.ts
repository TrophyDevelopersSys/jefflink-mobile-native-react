import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCmsSettingsDto {
  @ApiPropertyOptional({ example: 'JeffLink' })
  @IsString()
  @IsOptional()
  appName?: string;

  @ApiPropertyOptional({ example: 'support@jefflinkcars.com' })
  @IsString()
  @IsOptional()
  supportEmail?: string;

  @ApiPropertyOptional({ example: '+256700000000' })
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @ApiPropertyOptional({ example: 'UGX' })
  @IsString()
  @IsOptional()
  currencyDisplay?: string;

  @ApiPropertyOptional({ example: { enableHirePurchaseContent: true } })
  @IsObject()
  @IsOptional()
  features?: Record<string, boolean>;
}
