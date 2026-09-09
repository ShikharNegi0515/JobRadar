import { type Relation } from 'typeorm';
import { User } from './user.entity.js';
import { Skill } from '../../skills/entities/skill.entity.js';
export declare class UserSkill {
    id: string;
    user: Relation<User>;
    skill: Relation<Skill>;
    proficiency: number;
}
