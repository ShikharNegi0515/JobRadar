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
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from './entities/application.entity.js';
let ApplicationsService = class ApplicationsService {
    applicationsRepository;
    constructor(applicationsRepository) {
        this.applicationsRepository = applicationsRepository;
    }
    async findAllByUser(userId) {
        const apps = await this.applicationsRepository.find({
            where: { user: { id: userId } },
            relations: { jobPost: { skills: true } },
            order: { created_at: 'DESC' },
        });
        return { success: true, data: apps };
    }
    async create(userId, createDto) {
        const app = this.applicationsRepository.create({
            user: { id: userId },
            jobPost: { id: createDto.jobPostId },
            status: ApplicationStatus.INTERESTED,
            notes: createDto.notes,
        });
        const saved = await this.applicationsRepository.save(app);
        return { success: true, data: saved };
    }
    async update(userId, id, updateDto) {
        const app = await this.applicationsRepository.findOne({
            where: { id, user: { id: userId } },
        });
        if (!app)
            throw new NotFoundException('Application not found');
        Object.assign(app, updateDto);
        if (updateDto.status === ApplicationStatus.APPLIED && !app.applied_at) {
            app.applied_at = new Date();
        }
        const saved = await this.applicationsRepository.save(app);
        return { success: true, data: saved };
    }
    async remove(userId, id) {
        const app = await this.applicationsRepository.findOne({
            where: { id, user: { id: userId } },
        });
        if (!app)
            throw new NotFoundException('Application not found');
        await this.applicationsRepository.remove(app);
        return { success: true, message: 'Application removed' };
    }
};
ApplicationsService = __decorate([
    Injectable(),
    __param(0, InjectRepository(Application)),
    __metadata("design:paramtypes", [Repository])
], ApplicationsService);
export { ApplicationsService };
//# sourceMappingURL=applications.service.js.map