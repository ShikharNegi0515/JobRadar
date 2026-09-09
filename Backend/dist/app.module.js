var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { ScheduleModule } from '@nestjs/schedule';
import { IngestionModule } from './ingestion/ingestion.module.js';
let AppModule = class AppModule {
    async onApplicationBootstrap() {
    }
};
AppModule = __decorate([
    Module({
        imports: [
            ConfigModule.forRoot({ isGlobal: true }),
            ScheduleModule.forRoot(),
            TypeOrmModule.forRootAsync({
                imports: [ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST'),
                    port: parseInt(configService.get('DB_PORT') ?? '5432', 10) || 5432,
                    username: configService.get('DB_USERNAME'),
                    password: configService.get('DB_PASSWORD'),
                    database: configService.get('DB_DATABASE'),
                    entities: [User, JobPost, Skill, SavedJob, Application, UserSkill],
                    synchronize: configService.get('NODE_ENV') !== 'production',
                }),
                inject: [ConfigService],
            }),
            AuthModule,
            UsersModule,
            JobsModule,
            SkillsModule,
            ApplicationsModule,
            SavedJobsModule,
            HealthModule,
            IngestionModule,
        ],
        controllers: [AppController],
        providers: [AppService],
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map