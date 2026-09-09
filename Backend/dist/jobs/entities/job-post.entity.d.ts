import { Skill } from '../../skills/entities/skill.entity.js';
import { SavedJob } from './saved-job.entity.js';
import { Application } from '../../applications/entities/application.entity.js';
export declare enum JobStatus {
    ACTIVE = "ACTIVE",
    EXPIRED = "EXPIRED"
}
export declare enum WorkMode {
    REMOTE = "REMOTE",
    HYBRID = "HYBRID",
    ONSITE = "ONSITE",
    NOT_SPECIFIED = "NOT_SPECIFIED"
}
export declare enum EmploymentType {
    FULL_TIME = "FULL_TIME",
    PART_TIME = "PART_TIME",
    CONTRACT = "CONTRACT",
    INTERNSHIP = "INTERNSHIP"
}
export declare class JobPost {
    id: string;
    source: string;
    source_post_id: string;
    source_url: string;
    author_name: string;
    author_profile_url: string;
    raw_content: string;
    job_title: string;
    company_name: string;
    description: string;
    location: string;
    work_mode: WorkMode;
    employment_type: EmploymentType;
    experience_min: number;
    experience_max: number;
    salary_min: number;
    salary_max: number;
    salary_currency: string;
    application_email: string;
    application_url: string;
    posted_at: Date;
    likes: number;
    comments: number;
    shares: number;
    popularity_score: number;
    is_job_post: boolean;
    classification_confidence: number;
    content_hash: string;
    status: JobStatus;
    skills: Skill[];
    savedBy: SavedJob[];
    applications: Application[];
    created_at: Date;
    updated_at: Date;
}
