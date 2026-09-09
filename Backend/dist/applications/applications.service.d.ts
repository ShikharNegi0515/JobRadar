import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from './entities/application.entity.js';
export declare class ApplicationsService {
    private applicationsRepository;
    constructor(applicationsRepository: Repository<Application>);
    findAllByUser(userId: string): Promise<{
        success: boolean;
        data: Application[];
    }>;
    create(userId: string, createDto: {
        jobPostId: string;
        notes?: string;
    }): Promise<{
        success: boolean;
        data: Application;
    }>;
    update(userId: string, id: string, updateDto: {
        status?: ApplicationStatus;
        notes?: string;
    }): Promise<{
        success: boolean;
        data: Application;
    }>;
    remove(userId: string, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
