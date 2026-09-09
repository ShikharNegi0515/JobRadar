var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';
import { JobsModule } from './jobs/jobs.module.js';
import { SkillsModule } from './skills/skills.module.js';
import { ApplicationsModule } from './applications/applications.module.js';
import { AuthModule } from './auth/auth.module.js';
import { SavedJobsModule } from './saved-jobs/saved-jobs.module.js';
import { HealthModule } from './health/health.module.js';
import { User } from './users/entities/user.entity.js';
import { JobPost } from './jobs/entities/job-post.entity.js';
import { Skill } from './skills/entities/skill.entity.js';
import { SavedJob } from './jobs/entities/saved-job.entity.js';
import { Application } from './applications/entities/application.entity.js';
import { UserSkill } from './users/entities/user-skill.entity.js';
import { JobsService } from './jobs/jobs.service.js';
let AppModule = class AppModule {
    jobsService;
    constructor(jobsService) {
        this.jobsService = jobsService;
    }
    async onApplicationBootstrap() {
        try {
            await this.jobsService.seedMockJobs();
        }
        catch (e) {
            console.warn('⚠️  Seeding skipped (DB may not be ready):', e.message);
        }
    }
};
AppModule = __decorate([
    Module({
        imports: [
            ConfigModule.forRoot({ isGlobal: true }),
            TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT ?? '5432', 10) || 5432,
                username: process.env.DB_USERNAME || 'user',
                password: process.env.DB_PASSWORD || 'password',
                database: process.env.DB_DATABASE || 'jobradar',
                entities: [User, JobPost, Skill, SavedJob, Application, UserSkill],
                synchronize: process.env.NODE_ENV !== 'production',
            }),
            AuthModule,
            UsersModule,
            JobsModule,
            SkillsModule,
            ApplicationsModule,
            SavedJobsModule,
            HealthModule,
        ],
        controllers: [AppController],
        providers: [AppService],
    }),
    __metadata("design:paramtypes", [JobsService])
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map