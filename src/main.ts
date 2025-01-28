import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  ConsoleLogger,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app.module';
import { ApplyExceptionFilter } from './shared/apply-exception.filter';

async function bootstrap(): Promise<void> {
  const httpAdapter = new FastifyAdapter({
    logger: true,
  });
  httpAdapter.enableCors({ origin: '*' });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    httpAdapter,
    {
      rawBody: true,
      logger: new ConsoleLogger({
        json: process.env.NODE_ENV === 'production',
      }),
    },
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new ApplyExceptionFilter());

  loadSwagger(app);

  const port = parseInt(process.env.PORT || '3000', 10);
  const host = process.env.HOST || '';

  await app.listen(port, host);
}
function loadSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Apply Digital Challenge')
    .setDescription('This is the documentation for the Apply Digital Challenge')
    .setVersion('1.0.0')
    .addBearerAuth({ in: 'header', type: 'http', bearerFormat: 'JWT' })
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
}

void bootstrap();
