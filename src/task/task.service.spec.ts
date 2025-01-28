import { Test, TestingModule } from '@nestjs/testing';

import { TaskService } from './task.service';
import { ContentfulService } from '../contentful/contentful.service';
import { ProductService } from '../product/product.service';
import { SyncLogService } from '../sync-log/sync-log.service';

describe('TaskService', () => {
  let service: TaskService;
  let contentfulService: jest.Mocked<ContentfulService>;
  let productService: jest.Mocked<ProductService>;
  let syncLogService: jest.Mocked<SyncLogService>;

  const mockContentfulService = {
    getContentfulData: jest.fn(),
  };

  const mockProductService = {
    updateOrCreate: jest.fn(),
    updateDeleted: jest.fn(),
  };

  const mockSyncLogService = {
    findLatest: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: ContentfulService,
          useValue: mockContentfulService,
        },
        {
          provide: ProductService,
          useValue: mockProductService,
        },
        {
          provide: SyncLogService,
          useValue: mockSyncLogService,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    contentfulService = module.get(ContentfulService);
    productService = module.get(ProductService);
    syncLogService = module.get(SyncLogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleCron', () => {
    const mockContentfulResponse = {
      entries: [
        {
          fields: {
            name: { 'en-US': 'Product 1' },
            sku: { 'en-US': 'SKU1' },
            price: { 'en-US': 100 },
          },
        },
      ],
      deletedEntries: [
        {
          fields: {
            sku: { 'en-US': 'SKU2' },
          },
        },
      ],
      nextSyncToken: 'next-token',
    };

    it('should process new sync with no previous sync token', async () => {
      mockSyncLogService.findLatest.mockResolvedValue(null);
      mockContentfulService.getContentfulData.mockResolvedValue(
        mockContentfulResponse,
      );

      await service.handleCron();

      expect(contentfulService.getContentfulData).toHaveBeenCalledWith(
        'product',
        undefined,
      );
      expect(syncLogService.create).toHaveBeenCalledWith(
        mockContentfulResponse,
      );
      expect(productService.updateOrCreate).toHaveBeenCalledWith({
        name: 'Product 1',
        sku: 'SKU1',
        price: 100,
      });
      expect(productService.updateDeleted).toHaveBeenCalledWith({
        sku: 'SKU2',
      });
    });

    it('should process sync with previous sync token', async () => {
      const previousSyncLog = {
        data: {
          nextSyncToken: 'previous-token',
        },
      };
      mockSyncLogService.findLatest.mockResolvedValue(previousSyncLog);
      mockContentfulService.getContentfulData.mockResolvedValue(
        mockContentfulResponse,
      );

      await service.handleCron();

      expect(contentfulService.getContentfulData).toHaveBeenCalledWith(
        'product',
        'previous-token',
      );
    });

    it('should handle empty response from Contentful', async () => {
      mockSyncLogService.findLatest.mockResolvedValue(null);
      mockContentfulService.getContentfulData.mockResolvedValue(null);

      await service.handleCron();

      expect(syncLogService.create).not.toHaveBeenCalled();
      expect(productService.updateOrCreate).not.toHaveBeenCalled();
      expect(productService.updateDeleted).not.toHaveBeenCalled();
    });
  });

  describe('convertObject', () => {
    it('should convert Contentful format to plain object', () => {
      const input = {
        name: { 'en-US': 'Test Product' },
        price: { 'en-US': 100 },
        description: { 'en-US': 'Test Description' },
      };

      const result = service['convertObject'](input);

      expect(result).toEqual({
        name: 'Test Product',
        price: 100,
        description: 'Test Description',
      });
    });

    it('should handle empty input object', () => {
      const input = {};

      const result = service['convertObject'](input);

      expect(result).toEqual({});
    });

    it('should handle null or undefined values', () => {
      const input = {
        name: { 'en-US': null },
        price: { 'en-US': undefined },
        sku: { 'en-US': 'SKU1' },
      };

      const result = service['convertObject'](input);

      expect(result).toEqual({
        name: null,
        price: undefined,
        sku: 'SKU1',
      });
    });
  });
});
