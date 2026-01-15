// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ADD THIS LINE!
  app.enableCors();

  await app.listen(3000);
}
bootstrap();