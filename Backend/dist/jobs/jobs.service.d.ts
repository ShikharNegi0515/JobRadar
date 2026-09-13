import { Repository } from 'typeorm';
import { JobPost, JobStatus } from './entities/job-post.entity.js';
import { AIService } from '../ai/ai.service.js';
export interface JobQueryOptions {
    search?: string;
    sort?: 'recent' | 'popular' | 'most_score';
    location?: string;
    workMode?: string;
    employmentType?: string;
    experienceMin?: number;
    experienceMax?: number;
    skills?: string;
    userSkills?: string[];
    page?: number;
    limit?: number;
}
export declare class JobsService {
    private jobPostsRepository;
    private aiService;
    constructor(jobPostsRepository: Repository<JobPost>, aiService: AIService);
    findAll(options?: JobQueryOptions): Promise<{
        success: boolean;
        data: {
            jobs: JobPost[];
            pagination: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
            meta: {
                window: string;
                sort: "recent" | "popular" | "most_score";
                filters: {
                    search: string | undefined;
                    location: string | undefined;
                    workMode: string | undefined;
                    employmentType: string | undefined;
                    experienceMin: number | undefined;
                    experienceMax: number | undefined;
                    skills: string | undefined;
                };
            };
        };
    }>;
    findById(id: string): Promise<{
        success: boolean;
        message: string;
        code: string;
        data?: undefined;
    } | {
        success: boolean;
        data: JobPost;
        message?: undefined;
        code?: undefined;
    }>;
    getCount(): Promise<number>;
    getRecommendedJobs(userSkills: string[], resumeText?: string): Promise<{
        success: boolean;
        data: {
            ai_match: import("../ai/ai.service.js").AIMatchResult;
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
            work_mode: import("./entities/job-post.entity.js").WorkMode;
            employment_type: import("./entities/job-post.entity.js").EmploymentType;
            experience_min: number | null;
            experience_max: number | null;
            salary_min: number | null;
            salary_max: number | null;
            salary_currency: string | null;
            application_email: string | null;
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
            skills: import("typeorm").Relation<import("../skills/entities/skill.entity.js").Skill>[];
            savedBy: import("typeorm").Relation<import("./entities/saved-job.entity.js").SavedJob>[];
            applications: import("typeorm").Relation<import("../applications/entities/application.entity.js").Application>[];
            created_at: Date;
            updated_at: Date;
        }[];
        meta: {
            totalEvaluated: number;
            totalRecommended: number;
            threshold: number;
        };
    }>;
    seedMockJobs(): Promise<void>;
}
