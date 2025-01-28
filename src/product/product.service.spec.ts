import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindOperator, Repository } from 'typeorm';
import { ProductService } from './product.service';
import { Product } from './product.entity';

describe('ProductService', () => {
  let service: ProductService;
  let repository: Repository<Product>;

  const mockRepository = {
    upsert: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
    findOneBy: jest.fn(),
    softDelete: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateOrCreate', () => {
    it('should upsert a product', async () => {
      const product = { sku: 'TEST123', name: 'Test Product' };
      mockRepository.upsert.mockResolvedValue({ raw: [], generatedMaps: [] });

      await service.updateOrCreate(product);

      expect(repository.upsert).toHaveBeenCalledWith(product, ['sku']);
    });
  });

  describe('updateDeleted', () => {
    it('should update deletedAt for a product', async () => {
      const sku = 'TEST123';
      const now = new Date();
      jest.useFakeTimers().setSystemTime(now);

      await service.updateDeleted({ sku });

      expect(repository.update).toHaveBeenCalledWith(
        { sku },
        { deletedAt: now }
      );
    });
  });

  describe('findByPage', () => {
    const mockQueryBuilder = {
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };

    beforeEach(() => {
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });

    it('should return paginated products', async () => {
      const page = 2;
      const limit = 5;
      const expectedProducts = [{ id: 1, name: 'Product 1' }];
      const expectedCount = 1;

      mockQueryBuilder.getManyAndCount.mockResolvedValue([expectedProducts, expectedCount]);

      const result = await service.findByPage(page, limit);

      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(limit);
      expect(mockQueryBuilder.offset).toHaveBeenCalledWith(limit * page - limit);
      expect(result).toEqual([expectedProducts, expectedCount]);
    });
  });

  describe('findBySku', () => {
    it('should find a product by SKU', async () => {
      const sku = 'TEST123';
      const expectedProduct = { id: 1, sku, name: 'Test Product' };
      mockRepository.findOneBy.mockResolvedValue(expectedProduct);

      const result = await service.findBySku(sku);

      expect(repository.findOneBy).toHaveBeenCalledWith({ sku });
      expect(result).toEqual(expectedProduct);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a product', async () => {
      const id = 1;
      const expectedResult = { affected: 1, raw: [] };
      mockRepository.softDelete.mockResolvedValue(expectedResult);

      const result = await service.softDelete(id);

      expect(repository.softDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('count methods', () => {
    it('should return total count', async () => {
      const expectedCount = 10;
      mockRepository.count.mockResolvedValue(expectedCount);

      const result = await service.count();

      expect(repository.count).toHaveBeenCalled();
      expect(result).toBe(expectedCount);
    });

    it('should return count of deleted products', async () => {
      const expectedCount = 5;
      mockRepository.count.mockResolvedValue(expectedCount);

      const result = await service.countDeleted();

      expect(repository.count).toHaveBeenCalledWith({
        where: { deletedAt: expect.any(FindOperator) },
        withDeleted: true,
      });
      expect(result).toBe(expectedCount);
    });

    it('should return count of products with price', async () => {
      const expectedCount = 8;
      mockRepository.count.mockResolvedValue(expectedCount);

      const result = await service.countWithPrice();

      expect(repository.count).toHaveBeenCalledWith({
        where: { price: expect.any(FindOperator) },
      });
      expect(result).toBe(expectedCount);
    });

    it('should return count of products without price', async () => {
      const expectedCount = 2;
      mockRepository.count.mockResolvedValue(expectedCount);

      const result = await service.countWithoutPrice();

      expect(repository.count).toHaveBeenCalledWith({
        where: { price: expect.any(FindOperator) },
      });
      expect(result).toBe(expectedCount);
    });

    it('should return count of products in date range', async () => {
      const expectedCount = 3;
      const minDate = new Date('2024-01-01');
      const maxDate = new Date('2024-01-31');
      mockRepository.count.mockResolvedValue(expectedCount);

      const result = await service.countInRange(minDate, maxDate);

      expect(repository.count).toHaveBeenCalledWith({
        where: { createdAt: expect.any(FindOperator) },
      });
      expect(result).toBe(expectedCount);
    });
  });

  describe('getCategoryCounts', () => {
    const mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    };

    beforeEach(() => {
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });

    it('should return category counts', async () => {
      const expectedResult = [
        { category: 'Electronics', count: '5' },
        { category: 'Books', count: '3' },
      ];
      mockQueryBuilder.getRawMany.mockResolvedValue(expectedResult);

      const result = await service.getCategoryCounts();

      expect(mockQueryBuilder.select).toHaveBeenCalledWith('product.category', 'category');
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('COUNT(*)', 'count');
      expect(mockQueryBuilder.groupBy).toHaveBeenCalledWith('product.category');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('count', 'DESC');
      expect(result).toEqual(expectedResult);
    });
  });
});
