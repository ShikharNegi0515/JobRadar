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
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedJob } from '../jobs/entities/saved-job.entity.js';
let SavedJobsService = class SavedJobsService {
    savedJobsRepository;
    constructor(savedJobsRepository) {
        this.savedJobsRepository = savedJobsRepository;
    }
    async findAllByUser(userId) {
        const saved = await this.savedJobsRepository.find({
            where: { user: { id: userId } },
            relations: { jobPost: { skills: true } },
            order: { created_at: 'DESC' },
        });
        return { success: true, data: saved };
    }
    async save(userId, jobPostId) {
        const existing = await this.savedJobsRepository.findOne({
            where: { user: { id: userId }, jobPost: { id: jobPostId } },
        });
        if (existing) {
            throw new ConflictException('Job already saved');
        }
        const savedJob = this.savedJobsRepository.create({
            user: { id: userId },
            jobPost: { id: jobPostId },
        });
        const result = await this.savedJobsRepository.save(savedJob);
        return { success: true, data: result };
    }
    async remove(userId, jobPostId) {
        const savedJob = await this.savedJobsRepository.findOne({
            where: { user: { id: userId }, jobPost: { id: jobPostId } },
        });
        if (!savedJob)
            throw new NotFoundException('Saved job not found');
        await this.savedJobsRepository.remove(savedJob);
        return { success: true, message: 'Job unsaved successfully' };
    }
};
SavedJobsService = __decorate([
    Injectable(),
    __param(0, InjectRepository(SavedJob)),
    __metadata("design:paramtypes", [Repository])
], SavedJobsService);
export { SavedJobsService };
//# sourceMappingURL=saved-jobs.service.js.map