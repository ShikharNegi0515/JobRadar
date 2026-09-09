var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity.js';
let SkillsService = class SkillsService {
    skillsRepository;
    constructor(skillsRepository) {
        this.skillsRepository = skillsRepository;
    }
    async findAll() {
        return this.skillsRepository.find({ order: { name: 'ASC' } });
    }
    async findOrCreate(name) {
        const normalized = this.normalize(name);
        let skill = await this.skillsRepository.findOne({ where: { name: normalized } });
        if (!skill) {
            skill = this.skillsRepository.create({ name: normalized });
            skill = await this.skillsRepository.save(skill);
        }
        return skill;
    }
    normalize(name) {
        const map = {
            'node': 'Node.js',
            'nodejs': 'Node.js',
            'node.js': 'Node.js',
            'react': 'React',
            'reactjs': 'React',
            'react.js': 'React',
            'postgres': 'PostgreSQL',
            'postgresql': 'PostgreSQL',
            'mongo': 'MongoDB',
            'mongodb': 'MongoDB',
            'typescript': 'TypeScript',
            'javascript': 'JavaScript',
            'python': 'Python',
            'java': 'Java',
            'kubernetes': 'Kubernetes',
            'k8s': 'Kubernetes',
            'aws': 'AWS',
            'docker': 'Docker',
            'redis': 'Redis',
            'nestjs': 'NestJS',
            'express': 'Express.js',
            'expressjs': 'Express.js',
            'vuejs': 'Vue.js',
            'vue': 'Vue.js',
            'angularjs': 'Angular',
            'angular': 'Angular',
            'nextjs': 'Next.js',
            'next.js': 'Next.js',
        };
        const lower = name.toLowerCase().trim();
        return map[lower] || name.trim();
    }
};
SkillsService = __decorate([
    Injectable(),
    __param(0, InjectRepository(Skill)),
    __metadata("design:paramtypes", [Repository])
], SkillsService);
export { SkillsService };
//# sourceMappingURL=skills.service.js.map