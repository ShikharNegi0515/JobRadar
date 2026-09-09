import { User } from './user.entity.js';
import { Skill } from '../../skills/entities/skill.entity.js';
export declare class UserSkill {
    id: string;
    user: User;
    skill: Skill;
    proficiency: number;
}
