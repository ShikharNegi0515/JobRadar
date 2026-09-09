import { OnApplicationBootstrap } from '@nestjs/common';
import { JobsService } from './jobs/jobs.service.js';
export declare class AppModule implements OnApplicationBootstrap {
    private readonly jobsService;
    constructor(jobsService: JobsService);
    onApplicationBootstrap(): Promise<void>;
}
