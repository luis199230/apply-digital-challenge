import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class ProductPaginateDataResponse {
  @ApiProperty()
  @Expose()
  sku: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  brand: string;

  @ApiProperty()
  @Expose()
  model: string;

  @ApiProperty()
  @Expose()
  category: string;

  @ApiProperty()
  @Expose()
  color: string;

  @ApiProperty()
  @Expose()
  @Type(() => Number)
  price: number;

  @ApiProperty()
  @Expose()
  @Type(() => Number)
  stock: number;
}

export class PaginationResponse {
  @ApiProperty()
  @Expose()
  total: number;

  @ApiProperty({ example: 5 })
  @Expose()
  perPage: number;

  @ApiProperty({ example: 1 })
  @Expose()
  currentPage: number;

  @ApiProperty({ example: 1 })
  @Expose()
  lastPage: number;

  @ApiProperty({ example: 1 })
  @Expose()
  from: number;

  @ApiProperty({ example: 5 })
  @Expose()
  to: number;
}

export class ProductPaginateResponse {
  @ApiProperty()
  @Expose()
  status: boolean;

  @ApiProperty()
  @Expose()
  message: string;

  @ApiProperty()
  @Expose()
  data: ProductPaginateDataResponse;

  @ApiProperty()
  @Expose()
  meta: PaginationResponse;
}
