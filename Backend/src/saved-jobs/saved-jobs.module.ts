import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedJob } from '../jobs/entities/saved-job.entity.js';
import { SavedJobsService } from './saved-jobs.service.js';
import { SavedJobsController } from './saved-jobs.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([SavedJob])],
  providers: [SavedJobsService],
  controllers: [SavedJobsController],
})
export class SavedJobsModule {}
