import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, type Relation } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { JobPost } from './job-post.entity.js';

@Entity('saved_jobs')
export class SavedJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.savedJobs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @ManyToOne(() => JobPost, (jobPost) => jobPost.savedBy, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_post_id' })
  jobPost: Relation<JobPost>;

  @CreateDateColumn()
  created_at: Date;
}
