import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Query,
  UseGuards,
} from '@nestjs/common';

import { ProductService } from '../product/product.service';
import { ReportGetRequest } from './request/report-get.request';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ErrorResponse } from '../shared/error.response';
import { AuthGuard } from '@nestjs/passport';
import { ReportGetResponse } from './response/report-get.response';

@Controller('report')
export class ReportController {
  private readonly logger = new Logger(ReportController.name);

  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOkResponse({ type: ReportGetResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiOperation({ summary: 'Report list' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  public async report(@Query() query: ReportGetRequest) {
    const promises = [
      this.productService.count(),
      this.productService.countDeleted(),
      this.productService.countWithPrice(),
      this.productService.countWithoutPrice(),
    ];

    if (query.dateFrom && query.dateTo) {
      promises.push(
        this.productService.countInRange(query.dateFrom, query.dateTo),
      );
    }

    try {
      const [
        products,
        productsDeleted,
        productsWithPrice,
        productsWithoutPrice,
        productsInRange,
      ] = await Promise.all(promises);
      const categories = await this.productService.getCategoryCounts();

      return {
        status: true,
        message: 'Report was generated with success',
        data: {
          products: {
            count: products,
          },
          productsDeleted: {
            count: productsDeleted,
            percentage: Math.round((productsDeleted / products) * 100) + '%',
          },
          productsNonDeleted: {
            withPrice: {
              count: productsWithPrice,
              percentage:
                Math.round((productsWithPrice / products) * 100) + '%',
            },
            withoutPrice: {
              count: productsWithoutPrice,
              percentage:
                Math.round((productsWithoutPrice / products) * 100) + '%',
            },
          },
          productsInRange:
            query.dateFrom && query.dateTo
              ? {
                  from: query.dateFrom,
                  to: query.dateTo,
                  count: productsInRange,
                  percentage:
                    Math.round((productsInRange / products) * 100) + '%',
                }
              : undefined,
          categories,
        },
      };
    } catch (e) {
      this.logger.error('Report error', e);
      throw new BadRequestException('Error fetching results');
    }
  }
}
