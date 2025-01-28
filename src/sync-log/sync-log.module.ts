import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SyncLogService } from './sync-log.service';
import { SyncLog } from './sync-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SyncLog])],
  providers: [SyncLogService],
  exports: [SyncLogService],
})
export class SyncLogModule {}
