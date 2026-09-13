import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPost } from './entities/job-post.entity.js';
import { SavedJob } from './entities/saved-job.entity.js';
import { JobsService } from './jobs.service.js';
import { JobsController } from './jobs.controller.js';
import { AIModule } from '../ai/ai.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobPost, SavedJob]),
    forwardRef(() => AIModule)
  ],
  providers: [JobsService],
  controllers: [JobsController],
  exports: [JobsService],
})
export class JobsModule {}
