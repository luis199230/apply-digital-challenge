import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { TaskService } from './task.service';
import { ProductModule } from '../product/product.module';
import { ContentfulModule } from '../contentful/contentful.module';
import { SyncLogModule } from '../sync-log/sync-log.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ContentfulModule,
    ProductModule,
    SyncLogModule,
  ],
  providers: [TaskService],
})
export class TaskModule {}
