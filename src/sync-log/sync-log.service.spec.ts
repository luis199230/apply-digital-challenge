import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SyncLogService } from './sync-log.service';
import { SyncLog } from './sync-log.entity';

describe('SyncLogService', () => {
  let service: SyncLogService;
  let repository: Repository<SyncLog>;

  const mockRepository = {
    find: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncLogService,
        {
          provide: getRepositoryToken(SyncLog),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SyncLogService>(SyncLogService);
    repository = module.get<Repository<SyncLog>>(getRepositoryToken(SyncLog));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findLatest', () => {
    it('should return the latest sync log when logs exist', async () => {
      const mockSyncLog = {
        id: 1,
        data: { someData: 'test' } as any,
        createdAt: new Date(),
      };
      mockRepository.find.mockResolvedValue([mockSyncLog]);

      const result = await service.findLatest();

      expect(repository.find).toHaveBeenCalledWith({
        order: { id: 'DESC' },
        take: 1,
      });
      expect(result).toEqual(mockSyncLog);
    });

    it('should return null when no logs exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findLatest();

      expect(repository.find).toHaveBeenCalledWith({
        order: { id: 'DESC' },
        take: 1,
      });
      expect(result).toBeNull();
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      mockRepository.find.mockRejectedValue(error);

      await expect(service.findLatest()).rejects.toThrow(error);
      expect(repository.find).toHaveBeenCalledWith({
        order: { id: 'DESC' },
        take: 1,
      });
    });
  });

  describe('create', () => {
    it('should create a new sync log', async () => {
      const mockData = { someData: 'test' } as any;
      const mockSyncLog = {
        id: 1,
        data: mockData,
        createdAt: new Date(),
      };
      mockRepository.save.mockResolvedValue(mockSyncLog);

      const result = await service.create(mockData);

      expect(repository.save).toHaveBeenCalledWith({ data: mockData });
      expect(result).toEqual(mockSyncLog);
    });

    it('should handle repository errors during creation', async () => {
      const mockData = { someData: 'test' } as any;
      const error = new Error('Database error');
      mockRepository.save.mockRejectedValue(error);

      await expect(service.create(mockData)).rejects.toThrow(error);
      expect(repository.save).toHaveBeenCalledWith({ data: mockData });
    });
  });
});
