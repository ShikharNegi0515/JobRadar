import { Repository } from 'typeorm';
import { JobPost } from './entities/job-post.entity.js';
export interface JobQueryOptions {
    search?: string;
    sort?: 'recent' | 'popular';
    location?: string;
    workMode?: string;
    employmentType?: string;
    experienceMin?: number;
    experienceMax?: number;
    skills?: string;
    page?: number;
    limit?: number;
}
export declare class JobsService {
    private jobPostsRepository;
    constructor(jobPostsRepository: Repository<JobPost>);
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
                sort: "recent" | "popular";
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
    seedMockJobs(): Promise<void>;
}
