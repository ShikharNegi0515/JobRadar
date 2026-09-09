import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity.js';
export declare class SkillsService {
    private skillsRepository;
    constructor(skillsRepository: Repository<Skill>);
    findAll(): Promise<Skill[]>;
    findOrCreate(name: string): Promise<Skill>;
    private normalize;
}
