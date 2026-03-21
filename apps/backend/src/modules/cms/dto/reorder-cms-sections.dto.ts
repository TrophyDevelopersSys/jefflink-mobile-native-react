import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderCmsSectionsDto {
  @ApiProperty({ type: [String], description: 'Ordered section IDs' })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  sectionIds!: string[];
}
