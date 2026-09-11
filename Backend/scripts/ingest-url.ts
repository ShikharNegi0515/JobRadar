import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module.js';
import { IngestionService } from '../src/ingestion/ingestion.service.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ingestionService = app.get(IngestionService);
  
  const url = 'https://www.linkedin.com/feed/update/urn:li:activity:7503777239050760192/';
  console.log(`Starting ingestion for URL: ${url}`);
  
  await ingestionService.runIngestion([url]);
  
  await app.close();
  console.log('Ingestion completed.');
}
bootstrap();
