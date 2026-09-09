import { type Relation } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { JobPost } from './job-post.entity.js';
export declare class SavedJob {
    id: string;
    user: Relation<User>;
    jobPost: Relation<JobPost>;
    created_at: Date;
}
