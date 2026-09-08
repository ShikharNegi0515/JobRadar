import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Skill } from '../../skills/entities/skill.entity';
import { SavedJob } from './saved-job.entity';
import { Application } from '../../applications/entities/application.entity';

export enum JobStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
}

export enum WorkMode {
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID',
  ONSITE = 'ONSITE',
  NOT_SPECIFIED = 'NOT_SPECIFIED',
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
}

@Entity('job_posts')
@Index(['source', 'source_post_id'], { unique: true })
export class JobPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  source: string;

  @Column()
  @Index()
  source_post_id: string;

  @Column({ nullable: true })
  source_url: string;

  @Column({ nullable: true })
  author_name: string;

  @Column({ nullable: true })
  author_profile_url: string;

  @Column('text')
  raw_content: string;

  @Column()
  @Index()
  job_title: string;

  @Column()
  @Index()
  company_name: string;

  @Column('text')
  description: string;

  @Column()
  @Index()
  location: string;

  @Column({ type: 'enum', enum: WorkMode, default: WorkMode.NOT_SPECIFIED })
  @Index()
  work_mode: WorkMode;

  @Column({ type: 'enum', enum: EmploymentType, default: EmploymentType.FULL_TIME })
  employment_type: EmploymentType;

  @Column({ type: 'int', nullable: true })
  experience_min: number;

  @Column({ type: 'int', nullable: true })
  experience_max: number;

  @Column({ type: 'int', nullable: true })
  salary_min: number;

  @Column({ type: 'int', nullable: true })
  salary_max: number;

  @Column({ nullable: true })
  salary_currency: string;

  @Column({ nullable: true })
  application_email: string;

  @Column({ nullable: true })
  application_url: string;

  @Column({ type: 'timestamp' })
  @Index()
  posted_at: Date;

  @Column({ type: 'int', default: 0 })
  likes: number;

  @Column({ type: 'int', default: 0 })
  comments: number;

  @Column({ type: 'int', default: 0 })
  shares: number;

  @Column({ type: 'int', default: 0 })
  @Index()
  popularity_score: number;

  @Column({ type: 'boolean', default: false })
  is_job_post: boolean;

  @Column({ type: 'float', nullable: true })
  classification_confidence: number;

  @Column()
  content_hash: string;

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.ACTIVE })
  @Index()
  status: JobStatus;

  @ManyToMany(() => Skill)
  @JoinTable({
    name: 'job_post_skills',
    joinColumn: { name: 'job_post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'skill_id', referencedColumnName: 'id' },
  })
  skills: Skill[];

  @OneToMany(() => SavedJob, (savedJob) => savedJob.jobPost)
  savedBy: SavedJob[];

  @OneToMany(() => Application, (application) => application.jobPost)
  applications: Application[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
