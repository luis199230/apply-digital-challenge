import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Validate,
  ValidateIf,
} from 'class-validator';

import { IsPriceMinLessThanPriceMax } from '../../shared/validator';

export class ProductPaginateRequest {
  @ApiPropertyOptional()
  @IsNumber()
  @Expose()
  @IsOptional()
  @IsPositive()
  page?: number;

  @ApiPropertyOptional()
  @Expose()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @Expose()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @Expose()
  @ValidateIf((o: ProductPaginateRequest) => o.priceMax !== undefined)
  @IsNumber()
  @IsNotEmpty({ message: 'priceMin is required if priceMax is defined' })
  @IsPositive()
  @Validate(IsPriceMinLessThanPriceMax)
  priceMin?: number;

  @ApiPropertyOptional()
  @Expose()
  @ValidateIf((o: ProductPaginateRequest) => o.priceMin !== undefined)
  @IsNumber()
  @IsNotEmpty({ message: 'priceMax is required if priceMin is defined' })
  @IsPositive()
  @Validate(IsPriceMinLessThanPriceMax)
  priceMax?: number;
}
