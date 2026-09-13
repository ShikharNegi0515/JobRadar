import { Module, forwardRef } from '@nestjs/common';
import { AIService } from './ai.service.js';
import { AIController } from './ai.controller.js';
import { JobsModule } from '../jobs/jobs.module.js';

@Module({
  imports: [forwardRef(() => JobsModule)],
  controllers: [AIController],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}
