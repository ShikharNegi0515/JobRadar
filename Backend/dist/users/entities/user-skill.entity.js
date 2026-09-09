var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, ManyToOne, JoinColumn, Column, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity.js';
import { Skill } from '../../skills/entities/skill.entity.js';
let UserSkill = class UserSkill {
    id;
    user;
    skill;
    proficiency;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], UserSkill.prototype, "id", void 0);
__decorate([
    ManyToOne(() => User, (user) => user.skills, { onDelete: 'CASCADE' }),
    JoinColumn({ name: 'user_id' }),
    __metadata("design:type", Object)
], UserSkill.prototype, "user", void 0);
__decorate([
    ManyToOne(() => Skill, { onDelete: 'CASCADE' }),
    JoinColumn({ name: 'skill_id' }),
    __metadata("design:type", Object)
], UserSkill.prototype, "skill", void 0);
__decorate([
    Column({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], UserSkill.prototype, "proficiency", void 0);
UserSkill = __decorate([
    Entity('user_skills')
], UserSkill);
export { UserSkill };
//# sourceMappingURL=user-skill.entity.js.map