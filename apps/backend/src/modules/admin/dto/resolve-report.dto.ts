import { IsIn, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResolveReportDto {
  @ApiProperty({ enum: ['RESOLVED', 'DISMISSED'] })
  @IsIn(['RESOLVED', 'DISMISSED'])
  resolution!: 'RESOLVED' | 'DISMISSED';

  @ApiProperty({ description: 'Resolution note for internal audit trail' })
  @IsString()
  @MaxLength(1000)
  resolutionNote!: string;
}
