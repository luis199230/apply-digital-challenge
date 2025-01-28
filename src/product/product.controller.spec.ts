import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductPaginateRequest } from './request/product-paginate.request';

describe('ProductController', () => {
  let controller: ProductController;
  let productService: jest.Mocked<ProductService>;

  beforeEach(async () => {
    const mockProductService = {
      findByPage: jest.fn(),
      findBySku: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProductController>(ProductController);
    productService = module.get(ProductService);
  });

  describe('paginate', () => {
    it('should return paginated products', async () => {
      const mockQuery: ProductPaginateRequest = { page: 1 };
      const mockProducts = [
        { id: 1, name: 'Product 1' },
        { id: 2, name: 'Product 2' },
      ];
      const mockCount = 2;

      productService.findByPage.mockResolvedValueOnce([
        mockProducts as any,
        mockCount,
      ]);

      const result = await controller.paginate(mockQuery);

      expect(result).toEqual({
        status: true,
        message: 'Showing products',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.any(Array),
        meta: {
          total: mockCount,
          perPage: 5,
          currentPage: 1,
          lastPage: 1,
          from: 1,
          to: 5,
        },
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(productService.findByPage).toHaveBeenCalledWith(1, 5);
    });
  });

  describe('delete', () => {
    it('should delete a product successfully', async () => {
      const mockSku = 'test-sku';
      const mockProduct = { id: 1, name: 'Product 1', sku: mockSku };

      productService.findBySku.mockResolvedValueOnce(mockProduct as any);
      productService.softDelete.mockResolvedValueOnce(undefined as any);

      const result = await controller.delete(mockSku);

      expect(result).toEqual({
        status: true,
        message: 'Product deleted',
      });

      expect(productService.findBySku).toHaveBeenCalledWith(mockSku);
      expect(productService.softDelete).toHaveBeenCalledWith(mockProduct.id);
    });

    it('should throw BadRequestException if product is not found', async () => {
      const mockSku = 'invalid-sku';

      productService.findBySku.mockResolvedValueOnce(null);

      await expect(controller.delete(mockSku)).rejects.toThrow(
        BadRequestException,
      );

      expect(productService.findBySku).toHaveBeenCalledWith(mockSku);
      expect(productService.softDelete).not.toHaveBeenCalled();
    });
  });
});
