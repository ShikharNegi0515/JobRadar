var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { JobPost } from './job-post.entity.js';
let SavedJob = class SavedJob {
    id;
    user;
    jobPost;
    created_at;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], SavedJob.prototype, "id", void 0);
__decorate([
    ManyToOne(() => User, (user) => user.savedJobs, { onDelete: 'CASCADE' }),
    JoinColumn({ name: 'user_id' }),
    __metadata("design:type", User)
], SavedJob.prototype, "user", void 0);
__decorate([
    ManyToOne(() => JobPost, (jobPost) => jobPost.savedBy, { onDelete: 'CASCADE' }),
    JoinColumn({ name: 'job_post_id' }),
    __metadata("design:type", JobPost)
], SavedJob.prototype, "jobPost", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], SavedJob.prototype, "created_at", void 0);
SavedJob = __decorate([
    Entity('saved_jobs')
], SavedJob);
export { SavedJob };
//# sourceMappingURL=saved-job.entity.js.map