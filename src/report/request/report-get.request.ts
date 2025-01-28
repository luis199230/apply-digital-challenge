import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class ReportGetRequest {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Expose()
  dateFrom?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Expose()
  dateTo?: Date;
}
