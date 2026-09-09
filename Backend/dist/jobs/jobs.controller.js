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
import { Controller, Get, Param, Query, ParseIntPipe, DefaultValuePipe, NotFoundException, } from '@nestjs/common';
import { JobsService } from './jobs.service.js';
let JobsController = class JobsController {
    jobsService;
    constructor(jobsService) {
        this.jobsService = jobsService;
    }
    async findAll(search, sort = 'recent', location, workMode, employmentType, experienceMin, experienceMax, skills, page = 1, limit = 20) {
        return this.jobsService.findAll({
            search,
            sort,
            location,
            workMode,
            employmentType,
            experienceMin: experienceMin ? parseInt(experienceMin, 10) : undefined,
            experienceMax: experienceMax ? parseInt(experienceMax, 10) : undefined,
            skills,
            page,
            limit,
        });
    }
    async findOne(id) {
        const result = await this.jobsService.findById(id);
        if (!result.success) {
            throw new NotFoundException(result.message);
        }
        return result;
    }
};
__decorate([
    Get(),
    __param(0, Query('search')),
    __param(1, Query('sort')),
    __param(2, Query('location')),
    __param(3, Query('workMode')),
    __param(4, Query('employmentType')),
    __param(5, Query('experienceMin')),
    __param(6, Query('experienceMax')),
    __param(7, Query('skills')),
    __param(8, Query('page', new DefaultValuePipe(1), ParseIntPipe)),
    __param(9, Query('limit', new DefaultValuePipe(20), ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "findOne", null);
JobsController = __decorate([
    Controller('api/jobs'),
    __metadata("design:paramtypes", [JobsService])
], JobsController);
export { JobsController };
//# sourceMappingURL=jobs.controller.js.map