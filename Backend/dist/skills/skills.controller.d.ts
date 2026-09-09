import { SkillsService } from './skills.service.js';
export declare class SkillsController {
    private readonly skillsService;
    constructor(skillsService: SkillsService);
    findAll(): Promise<{
        success: boolean;
        data: import("./entities/skill.entity.js").Skill[];
    }>;
}
