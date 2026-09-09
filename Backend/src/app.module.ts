import { Module, OnApplicationBootstrap } from '@nestjs/common';
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
import { JobsService } from './jobs/jobs.service.js';

import { ScheduleModule } from '@nestjs/schedule';
import { IngestionModule } from './ingestion/ingestion.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT') ?? '5432', 10) || 5432,
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [User, JobPost, Skill, SavedJob, Application, UserSkill],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
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
export class AppModule implements OnApplicationBootstrap {
  async onApplicationBootstrap() {
    // Mock seeding disabled — only real scraped LinkedIn jobs are loaded
  }
}
