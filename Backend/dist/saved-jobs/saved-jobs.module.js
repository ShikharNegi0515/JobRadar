var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedJob } from '../jobs/entities/saved-job.entity.js';
import { SavedJobsService } from './saved-jobs.service.js';
import { SavedJobsController } from './saved-jobs.controller.js';
let SavedJobsModule = class SavedJobsModule {
};
SavedJobsModule = __decorate([
    Module({
        imports: [TypeOrmModule.forFeature([SavedJob])],
        providers: [SavedJobsService],
        controllers: [SavedJobsController],
    })
], SavedJobsModule);
export { SavedJobsModule };
//# sourceMappingURL=saved-jobs.module.js.map