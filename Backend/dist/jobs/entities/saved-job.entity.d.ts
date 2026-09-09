import { User } from '../../users/entities/user.entity.js';
import { JobPost } from './job-post.entity.js';
export declare class SavedJob {
    id: string;
    user: User;
    jobPost: JobPost;
    created_at: Date;
}
