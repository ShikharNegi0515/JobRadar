import { type Relation } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { JobPost } from '../../jobs/entities/job-post.entity.js';
export declare enum ApplicationStatus {
    INTERESTED = "INTERESTED",
    APPLIED = "APPLIED",
    SCREENING = "SCREENING",
    INTERVIEW = "INTERVIEW",
    REJECTED = "REJECTED",
    OFFER = "OFFER"
}
export declare class Application {
    id: string;
    user: Relation<User>;
    jobPost: Relation<JobPost>;
    status: ApplicationStatus;
    notes: string;
    applied_at: Date;
    created_at: Date;
    updated_at: Date;
}
