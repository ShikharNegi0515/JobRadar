import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedJob } from '../jobs/entities/saved-job.entity.js';
import { SavedJobsService } from './saved-jobs.service.js';
import { SavedJobsController } from './saved-jobs.controller.js';

import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([SavedJob]), AuthModule],
  providers: [SavedJobsService],
  controllers: [SavedJobsController],
  exports: [SavedJobsService],
})
export class SavedJobsModule {}
