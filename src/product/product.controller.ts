import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from '@nestjs/passport';

import { ProductService } from './product.service';
import { ProductPaginateRequest } from './request/product-paginate.request';
import {
  ProductPaginateDataResponse,
  ProductPaginateResponse,
} from './response/product-paginate.response';
import { ProductDeleteResponse } from './response/product-delete.response';
import { ErrorResponse } from '../shared/error.response';

@Controller('product')
@ApiTags('Product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  private generatePagination(limit: number, page: number, count: number) {
    return {
      total: count,
      perPage: limit,
      currentPage: page,
      lastPage: Math.ceil(count / limit) || 1,
      from: (page - 1) * limit + 1,
      to: page * limit,
    };
  }

  private mapperPagination(data: any[]) {
    return data.map((item) =>
      plainToInstance(ProductPaginateDataResponse, item, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Get()
  @ApiOkResponse({ type: ProductPaginateResponse })
  @ApiOperation({ summary: 'Product pagination and filter' })
  public async paginate(
    @Query()
    query: ProductPaginateRequest,
  ) {
    const limit = 5;
    const page = query.page || 1;

    const [data, count] = await this.productService.findByPage(page, limit);

    return {
      status: true,
      message: 'Showing products',
      data: this.mapperPagination(data),
      meta: this.generatePagination(limit, page, count),
    };
  }

  @Delete()
  @ApiOkResponse({ type: ProductDeleteResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiOperation({ summary: 'Product delete' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  public async delete(@Query('sku') sku: string) {
    const data = await this.productService.findBySku(sku);
    if (!data) {
      throw new BadRequestException('Product not found');
    }
    await this.productService.softDelete(data.id);
    return {
      status: true,
      message: 'Product deleted',
    };
  }
}
