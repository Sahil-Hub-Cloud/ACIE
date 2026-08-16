import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from the monorepo root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend dashboard (port 3000)
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Enable global DTO validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  const port = process.env.API_PORT || 3001;
  await app.listen(port);
  console.log(`⚡ ACIE API Server running on: http://localhost:${port}`);
}
bootstrap();
