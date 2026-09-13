var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPost } from './entities/job-post.entity.js';
import { SavedJob } from './entities/saved-job.entity.js';
import { JobsService } from './jobs.service.js';
import { JobsController } from './jobs.controller.js';
import { AIModule } from '../ai/ai.module.js';
let JobsModule = class JobsModule {
};
JobsModule = __decorate([
    Module({
        imports: [
            TypeOrmModule.forFeature([JobPost, SavedJob]),
            forwardRef(() => AIModule)
        ],
        providers: [JobsService],
        controllers: [JobsController],
        exports: [JobsService],
    })
], JobsModule);
export { JobsModule };
//# sourceMappingURL=jobs.module.js.map