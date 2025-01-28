import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ErrorResponse {
  @ApiProperty()
  @Expose()
  status: boolean;

  @ApiProperty()
  @Expose()
  message: string;
}
