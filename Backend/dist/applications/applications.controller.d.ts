import { ApplicationsService } from './applications.service.js';
import { ApplicationStatus } from './entities/application.entity.js';
export declare class ApplicationsController {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    findAll(req: any): Promise<{
        success: boolean;
        data: import("./entities/application.entity.js").Application[];
    }>;
    create(req: any, body: {
        jobPostId: string;
        notes?: string;
    }): Promise<{
        success: boolean;
        data: import("./entities/application.entity.js").Application;
    }>;
    update(req: any, id: string, body: {
        status?: ApplicationStatus;
        notes?: string;
    }): Promise<{
        success: boolean;
        data: import("./entities/application.entity.js").Application;
    }>;
    remove(req: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
