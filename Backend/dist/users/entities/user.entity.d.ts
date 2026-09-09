import { SavedJob } from '../../jobs/entities/saved-job.entity.js';
import { Application } from '../../applications/entities/application.entity.js';
import { UserSkill } from './user-skill.entity.js';
export declare class User {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    savedJobs: SavedJob[];
    applications: Application[];
    skills: UserSkill[];
    created_at: Date;
    updated_at: Date;
}
