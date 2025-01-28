import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { TaskModule } from './task/task.module';
import { ProductModule } from './product/product.module';
import { ReportModule } from './report/report.module';
import { SyncLogModule } from './sync-log/sync-log.module';
import databaseConfig from './config/typeorm.config';
import jwtConfig from './config/jwt.config';
import { JwtStrategy } from './shared/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, jwtConfig],
    }),
    TypeOrmModule.forRootAsync(databaseConfig.asProvider()),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ProductModule,
    TaskModule,
    ReportModule,
    SyncLogModule,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}
