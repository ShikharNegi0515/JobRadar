import { Module, OnApplicationBootstrap } from '@nestjs/common';
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

@Module({
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
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly jobsService: JobsService) {}

  async onApplicationBootstrap() {
    // Seed mock jobs on startup (will skip if data already exists)
    try {
      await this.jobsService.seedMockJobs();
    } catch (e) {
      console.warn('⚠️  Seeding skipped (DB may not be ready):', (e as Error).message);
    }
  }
}
