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
import { Controller, Get, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { SavedJobsService } from './saved-jobs.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
let SavedJobsController = class SavedJobsController {
    savedJobsService;
    constructor(savedJobsService) {
        this.savedJobsService = savedJobsService;
    }
    findAll(req) {
        return this.savedJobsService.findAllByUser(req.user.id);
    }
    save(req, jobId) {
        return this.savedJobsService.save(req.user.id, jobId);
    }
    remove(req, jobId) {
        return this.savedJobsService.remove(req.user.id, jobId);
    }
};
__decorate([
    Get(),
    __param(0, Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SavedJobsController.prototype, "findAll", null);
__decorate([
    Post(':jobId'),
    __param(0, Request()),
    __param(1, Param('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SavedJobsController.prototype, "save", null);
__decorate([
    Delete(':jobId'),
    __param(0, Request()),
    __param(1, Param('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SavedJobsController.prototype, "remove", null);
SavedJobsController = __decorate([
    UseGuards(JwtAuthGuard),
    Controller('api/saved-jobs'),
    __metadata("design:paramtypes", [SavedJobsService])
], SavedJobsController);
export { SavedJobsController };
//# sourceMappingURL=saved-jobs.controller.js.map