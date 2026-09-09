import { JobsService } from './jobs.service.js';
export declare class JobsController {
    private readonly jobsService;
    constructor(jobsService: JobsService);
    findAll(search?: string, sort?: 'recent' | 'popular', location?: string, workMode?: string, employmentType?: string, experienceMin?: string, experienceMax?: string, skills?: string, page?: number, limit?: number): Promise<{
        success: boolean;
        data: {
            jobs: import("./entities/job-post.entity.js").JobPost[];
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
    findOne(id: string): Promise<{
        success: boolean;
        message: string;
        code: string;
        data?: undefined;
    } | {
        success: boolean;
        data: import("./entities/job-post.entity.js").JobPost;
        message?: undefined;
        code?: undefined;
    }>;
}
