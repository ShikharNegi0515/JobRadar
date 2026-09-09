var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn, UpdateDateColumn, } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { JobPost } from '../../jobs/entities/job-post.entity.js';
export var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["INTERESTED"] = "INTERESTED";
    ApplicationStatus["APPLIED"] = "APPLIED";
    ApplicationStatus["SCREENING"] = "SCREENING";
    ApplicationStatus["INTERVIEW"] = "INTERVIEW";
    ApplicationStatus["REJECTED"] = "REJECTED";
    ApplicationStatus["OFFER"] = "OFFER";
})(ApplicationStatus || (ApplicationStatus = {}));
let Application = class Application {
    id;
    user;
    jobPost;
    status;
    notes;
    applied_at;
    created_at;
    updated_at;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Application.prototype, "id", void 0);
__decorate([
    ManyToOne(() => User, (user) => user.applications, { onDelete: 'CASCADE' }),
    JoinColumn({ name: 'user_id' }),
    __metadata("design:type", Object)
], Application.prototype, "user", void 0);
__decorate([
    ManyToOne(() => JobPost, (jobPost) => jobPost.applications, { onDelete: 'CASCADE' }),
    JoinColumn({ name: 'job_post_id' }),
    __metadata("design:type", Object)
], Application.prototype, "jobPost", void 0);
__decorate([
    Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.INTERESTED }),
    __metadata("design:type", String)
], Application.prototype, "status", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Application.prototype, "notes", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Application.prototype, "applied_at", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Application.prototype, "created_at", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Application.prototype, "updated_at", void 0);
Application = __decorate([
    Entity('applications')
], Application);
export { Application };
//# sourceMappingURL=application.entity.js.map