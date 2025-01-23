import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app.module';

function loadSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Apply Digital Challenge')
    .setDescription('This is the documentation for the Apply Digital Challenge')
    .setVersion('1.0.0')
    .addTag('apply-digital')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
}

async function bootstrap() {
  const adapter = new FastifyAdapter({ logger: true });
  adapter.enableCors({ origin: '*' });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    {
      rawBody: true,
    },
  );
  loadSwagger(app);

  await app.listen(+(process.env.PORT || 3000), process.env.HOST || '');
}

bootstrap();
