import { Repository } from 'typeorm';
import { SavedJob } from '../jobs/entities/saved-job.entity.js';
export declare class SavedJobsService {
    private savedJobsRepository;
    constructor(savedJobsRepository: Repository<SavedJob>);
    findAllByUser(userId: string): Promise<{
        success: boolean;
        data: SavedJob[];
    }>;
    save(userId: string, jobPostId: string): Promise<{
        success: boolean;
        data: SavedJob;
    }>;
    remove(userId: string, jobPostId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
