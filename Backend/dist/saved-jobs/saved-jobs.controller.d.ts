import { SavedJobsService } from './saved-jobs.service.js';
export declare class SavedJobsController {
    private readonly savedJobsService;
    constructor(savedJobsService: SavedJobsService);
    findAll(req: any): Promise<{
        success: boolean;
        data: import("../jobs/entities/saved-job.entity.js").SavedJob[];
    }>;
    save(req: any, jobId: string): Promise<{
        success: boolean;
        data: import("../jobs/entities/saved-job.entity.js").SavedJob;
    }>;
    remove(req: any, jobId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
