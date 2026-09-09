import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  type Relation,
} from 'typeorm';
import { SavedJob } from '../../jobs/entities/saved-job.entity.js';
import { Application } from '../../applications/entities/application.entity.js';
import { UserSkill } from './user-skill.entity.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @OneToMany(() => SavedJob, (savedJob) => savedJob.user)
  savedJobs: Relation<SavedJob>[];

  @OneToMany(() => Application, (application) => application.user)
  applications: Relation<Application>[];

  @OneToMany(() => UserSkill, (userSkill) => userSkill.user)
  skills: Relation<UserSkill>[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
