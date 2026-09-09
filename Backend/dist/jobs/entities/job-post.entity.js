var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToMany, JoinTable, OneToMany, } from 'typeorm';
import { Skill } from '../../skills/entities/skill.entity.js';
import { SavedJob } from './saved-job.entity.js';
import { Application } from '../../applications/entities/application.entity.js';
export var JobStatus;
(function (JobStatus) {
    JobStatus["ACTIVE"] = "ACTIVE";
    JobStatus["EXPIRED"] = "EXPIRED";
})(JobStatus || (JobStatus = {}));
export var WorkMode;
(function (WorkMode) {
    WorkMode["REMOTE"] = "REMOTE";
    WorkMode["HYBRID"] = "HYBRID";
    WorkMode["ONSITE"] = "ONSITE";
    WorkMode["NOT_SPECIFIED"] = "NOT_SPECIFIED";
})(WorkMode || (WorkMode = {}));
export var EmploymentType;
(function (EmploymentType) {
    EmploymentType["FULL_TIME"] = "FULL_TIME";
    EmploymentType["PART_TIME"] = "PART_TIME";
    EmploymentType["CONTRACT"] = "CONTRACT";
    EmploymentType["INTERNSHIP"] = "INTERNSHIP";
})(EmploymentType || (EmploymentType = {}));
let JobPost = class JobPost {
    id;
    source;
    source_post_id;
    source_url;
    author_name;
    author_profile_url;
    raw_content;
    job_title;
    company_name;
    description;
    location;
    work_mode;
    employment_type;
    experience_min;
    experience_max;
    salary_min;
    salary_max;
    salary_currency;
    application_email;
    application_url;
    posted_at;
    likes;
    comments;
    shares;
    popularity_score;
    is_job_post;
    classification_confidence;
    content_hash;
    status;
    skills;
    savedBy;
    applications;
    created_at;
    updated_at;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], JobPost.prototype, "id", void 0);
__decorate([
    Column(),
    Index(),
    __metadata("design:type", String)
], JobPost.prototype, "source", void 0);
__decorate([
    Column(),
    Index(),
    __metadata("design:type", String)
], JobPost.prototype, "source_post_id", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], JobPost.prototype, "source_url", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], JobPost.prototype, "author_name", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], JobPost.prototype, "author_profile_url", void 0);
__decorate([
    Column('text'),
    __metadata("design:type", String)
], JobPost.prototype, "raw_content", void 0);
__decorate([
    Column(),
    Index(),
    __metadata("design:type", String)
], JobPost.prototype, "job_title", void 0);
__decorate([
    Column(),
    Index(),
    __metadata("design:type", String)
], JobPost.prototype, "company_name", void 0);
__decorate([
    Column('text'),
    __metadata("design:type", String)
], JobPost.prototype, "description", void 0);
__decorate([
    Column(),
    Index(),
    __metadata("design:type", String)
], JobPost.prototype, "location", void 0);
__decorate([
    Column({ type: 'enum', enum: WorkMode, default: WorkMode.NOT_SPECIFIED }),
    Index(),
    __metadata("design:type", String)
], JobPost.prototype, "work_mode", void 0);
__decorate([
    Column({ type: 'enum', enum: EmploymentType, default: EmploymentType.FULL_TIME }),
    __metadata("design:type", String)
], JobPost.prototype, "employment_type", void 0);
__decorate([
    Column({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], JobPost.prototype, "experience_min", void 0);
__decorate([
    Column({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], JobPost.prototype, "experience_max", void 0);
__decorate([
    Column({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], JobPost.prototype, "salary_min", void 0);
__decorate([
    Column({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], JobPost.prototype, "salary_max", void 0);
__decorate([
    Column({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], JobPost.prototype, "salary_currency", void 0);
__decorate([
    Column({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], JobPost.prototype, "application_email", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], JobPost.prototype, "application_url", void 0);
__decorate([
    Column({ type: 'timestamp' }),
    Index(),
    __metadata("design:type", Date)
], JobPost.prototype, "posted_at", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], JobPost.prototype, "likes", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], JobPost.prototype, "comments", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], JobPost.prototype, "shares", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    Index(),
    __metadata("design:type", Number)
], JobPost.prototype, "popularity_score", void 0);
__decorate([
    Column({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], JobPost.prototype, "is_job_post", void 0);
__decorate([
    Column({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], JobPost.prototype, "classification_confidence", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], JobPost.prototype, "content_hash", void 0);
__decorate([
    Column({ type: 'enum', enum: JobStatus, default: JobStatus.ACTIVE }),
    Index(),
    __metadata("design:type", String)
], JobPost.prototype, "status", void 0);
__decorate([
    ManyToMany(() => Skill),
    JoinTable({
        name: 'job_post_skills',
        joinColumn: { name: 'job_post_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'skill_id', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], JobPost.prototype, "skills", void 0);
__decorate([
    OneToMany(() => SavedJob, (savedJob) => savedJob.jobPost),
    __metadata("design:type", Array)
], JobPost.prototype, "savedBy", void 0);
__decorate([
    OneToMany(() => Application, (application) => application.jobPost),
    __metadata("design:type", Array)
], JobPost.prototype, "applications", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], JobPost.prototype, "created_at", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], JobPost.prototype, "updated_at", void 0);
JobPost = __decorate([
    Entity('job_posts'),
    Index(['source', 'source_post_id'], { unique: true })
], JobPost);
export { JobPost };
//# sourceMappingURL=job-post.entity.js.map