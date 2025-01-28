import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SyncLog } from './sync-log.entity';

@Injectable()
export class SyncLogService {
  constructor(
    @InjectRepository(SyncLog)
    private syncLogRepository: Repository<SyncLog>,
  ) {}

  async findLatest(): Promise<SyncLog | null> {
    const results = await this.syncLogRepository.find({
      order: { id: 'DESC' },
      take: 1,
    });
    return results.length > 0 ? results[0] : null;
  }

  create(data: JSON): Promise<SyncLog> {
    return this.syncLogRepository.save({ data });
  }
}
