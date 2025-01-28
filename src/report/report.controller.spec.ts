import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { ReportController } from './report.controller';
import { ProductService } from '../product/product.service';
import { ReportGetRequest } from './request/report-get.request';

describe('ReportController', () => {
  let controller: ReportController;
  let productService: jest.Mocked<ProductService>;

  beforeEach(async () => {
    const mockProductService = {
      count: jest.fn(),
      countDeleted: jest.fn(),
      countWithPrice: jest.fn(),
      countWithoutPrice: jest.fn(),
      countInRange: jest.fn(),
      getCategoryCounts: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ReportController>(ReportController);
    productService = module.get(ProductService);
  });

  describe('report', () => {
    it('should return a generated report', async () => {
      const mockQuery: ReportGetRequest = {
        dateFrom: new Date('2023-01-01'),
        dateTo: new Date('2023-01-31'),
      };

      productService.count.mockResolvedValueOnce(100);
      productService.countDeleted.mockResolvedValueOnce(10);
      productService.countWithPrice.mockResolvedValueOnce(70);
      productService.countWithoutPrice.mockResolvedValueOnce(20);
      productService.countInRange.mockResolvedValueOnce(30);
      productService.getCategoryCounts.mockResolvedValueOnce([
        { category: 'Electronics', count: 40 },
        { category: 'Furniture', count: 30 },
      ]);

      const result = await controller.report(mockQuery);

      expect(result).toEqual({
        status: true,
        message: 'Report was generated with success',
        data: {
          products: {
            count: 100,
          },
          productsDeleted: {
            count: 10,
            percentage: '10%',
          },
          productsNonDeleted: {
            withPrice: {
              count: 70,
              percentage: '70%',
            },
            withoutPrice: {
              count: 20,
              percentage: '20%',
            },
          },
          productsInRange: {
            from: new Date('2023-01-01'),
            to: new Date('2023-01-31'),
            count: 30,
            percentage: '30%',
          },
          categories: [
            { category: 'Electronics', count: 40 },
            { category: 'Furniture', count: 30 },
          ],
        },
      });

      expect(productService.count).toHaveBeenCalled();
      expect(productService.countDeleted).toHaveBeenCalled();
      expect(productService.countWithPrice).toHaveBeenCalled();
      expect(productService.countWithoutPrice).toHaveBeenCalled();
      expect(productService.countInRange).toHaveBeenCalledWith(
        mockQuery.dateFrom,
        mockQuery.dateTo,
      );
      expect(productService.getCategoryCounts).toHaveBeenCalled();
    });

    it('should throw a BadRequestException on error', async () => {
      const mockQuery: ReportGetRequest = {};

      productService.count.mockRejectedValueOnce(new Error('Database error'));

      await expect(controller.report(mockQuery)).rejects.toThrow(
        BadRequestException,
      );

      expect(productService.count).toHaveBeenCalled();
    });
  });
});
