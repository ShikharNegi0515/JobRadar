import { DataSource } from 'typeorm';
import { User } from './src/users/entities/user.entity.js';
import { JobPost } from './src/jobs/entities/job-post.entity.js';
import { Skill } from './src/skills/entities/skill.entity.js';
import { SavedJob } from './src/jobs/entities/saved-job.entity.js';
import { Application } from './src/applications/entities/application.entity.js';
import { UserSkill } from './src/users/entities/user-skill.entity.js';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'jobradar',
  synchronize: false,
  logging: true,
  entities: [User, JobPost, Skill, SavedJob, Application, UserSkill],
  subscribers: [],
  migrations: ['src/database/migrations/*.ts'],
});
