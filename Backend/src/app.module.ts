import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';
import { JobsModule } from './jobs/jobs.module.js';
import { SkillsModule } from './skills/skills.module.js';
import { ApplicationsModule } from './applications/applications.module.js';
import { User } from './users/entities/user.entity.js';
import { JobPost } from './jobs/entities/job-post.entity.js';
import { Skill } from './skills/entities/skill.entity.js';
import { SavedJob } from './jobs/entities/saved-job.entity.js';
import { Application } from './applications/entities/application.entity.js';
import { UserSkill } from './users/entities/user-skill.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'user',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || 'jobradar',
      entities: [User, JobPost, Skill, SavedJob, Application, UserSkill],
      synchronize: process.env.NODE_ENV !== 'production', // Use synchronize in dev for MVP, otherwise migrations
    }),
    UsersModule,
    JobsModule,
    SkillsModule,
    ApplicationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
