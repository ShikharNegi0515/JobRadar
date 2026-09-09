import { Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service.js';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private usersService;
    constructor(usersService: UsersService);
    validate(payload: any): Promise<{
        id: string;
        name: string;
        email: string;
        savedJobs: import("typeorm").Relation<import("../jobs/entities/saved-job.entity.js").SavedJob>[];
        applications: import("typeorm").Relation<import("../applications/entities/application.entity.js").Application>[];
        skills: import("typeorm").Relation<import("../users/entities/user-skill.entity.js").UserSkill>[];
        created_at: Date;
        updated_at: Date;
    }>;
}
export {};
