import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinkedInScraperService } from './linkedin-scraper.service.js';
import { IngestionService } from './ingestion.service.js';
import { IngestionController } from './ingestion.controller.js';
import { AIModule } from '../ai/ai.module.js';
import { JobPost } from '../jobs/entities/job-post.entity.js';
import { Skill } from '../skills/entities/skill.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([JobPost, Skill]), AIModule],
  providers: [LinkedInScraperService, IngestionService],
  controllers: [IngestionController],
  exports: [IngestionService],
})
export class IngestionModule {}
