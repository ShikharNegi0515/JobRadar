import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { JobPost } from '../src/jobs/entities/job-post.entity.js';
import { Skill } from '../src/skills/entities/skill.entity.js';
import { User } from '../src/users/entities/user.entity.js';
import { SavedJob } from '../src/jobs/entities/saved-job.entity.js';
import { Application } from '../src/applications/entities/application.entity.js';
import { UserSkill } from '../src/users/entities/user-skill.entity.js';
import * as dotenv from 'dotenv';
dotenv.config();

const ds = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'carrace@123',
  database: process.env.DB_DATABASE || 'jobradar',
  entities: [User, JobPost, Skill, SavedJob, Application, UserSkill],
});

async function run() {
  await ds.initialize();
  const repo = ds.getRepository(JobPost);
  
  // 1. Delete mock jobs
  const deleteResult = await repo.delete({ source: 'mock' });
  console.log(`🗑️ Deleted ${deleteResult.affected || 0} mock jobs from database.`);

  // 2. Count remaining scraped jobs
  const totalCount = await repo.count();
  console.log(`📊 Total real scraped jobs in database: ${totalCount}`);

  // 3. Inspect top 5 scraped jobs
  const sampleJobs = await repo.find({ take: 5, order: { created_at: 'DESC' } });
  console.log('\nTop 5 Scraped Jobs Link URLs:');
  sampleJobs.forEach((j, i) => {
    console.log(`${i + 1}. [${j.job_title}] at [${j.company_name}]`);
    console.log(`   Source URL: ${j.source_url || '(none)'}`);
    console.log(`   App URL: ${j.application_url || '(none)'}`);
    console.log(`   Author URL: ${j.author_profile_url || '(none)'}`);
  });

  await ds.destroy();
}

run().catch(console.error);
