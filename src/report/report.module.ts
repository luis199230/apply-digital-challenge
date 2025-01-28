import { Module } from '@nestjs/common';

import { ReportController } from './report.controller';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [ProductModule],
  controllers: [ReportController],
})
export class ReportModule {}
