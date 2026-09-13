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
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobPost, JobStatus } from './entities/job-post.entity.js';
import { AIService } from '../ai/ai.service.js';
let JobsService = class JobsService {
    jobPostsRepository;
    aiService;
    constructor(jobPostsRepository, aiService) {
        this.jobPostsRepository = jobPostsRepository;
        this.aiService = aiService;
    }
    async findAll(options = {}) {
        const { search, sort = 'recent', location, workMode, employmentType, experienceMin, experienceMax, skills, userSkills, page = 1, limit = 20, } = options;
        const take = Math.min(limit, 100);
        const skip = (page - 1) * take;
        const qb = this.jobPostsRepository
            .createQueryBuilder('job')
            .leftJoinAndSelect('job.skills', 'skill')
            .where('job.posted_at >= NOW() - INTERVAL \'24 hours\'')
            .andWhere('job.status = :status', { status: JobStatus.ACTIVE })
            .andWhere('(job.experience_min IS NULL OR job.experience_min <= 2)');
        if (search) {
            qb.andWhere(`(
          to_tsvector('english', job.job_title || ' ' || job.company_name || ' ' || COALESCE(job.description, '') || ' ' || COALESCE(job.location, '')) @@ plainto_tsquery('english', :search)
          OR job.job_title ILIKE :searchLike
          OR job.company_name ILIKE :searchLike
          OR job.location ILIKE :searchLike
        )`, { search, searchLike: `%${search}%` });
        }
        if (location) {
            qb.andWhere('job.location ILIKE :location', { location: `%${location}%` });
        }
        if (workMode) {
            qb.andWhere('job.work_mode = :workMode', { workMode: workMode.toUpperCase() });
        }
        if (employmentType) {
            qb.andWhere('job.employment_type = :employmentType', { employmentType: employmentType.toUpperCase() });
        }
        if (experienceMin !== undefined) {
            qb.andWhere('(job.experience_max IS NULL OR job.experience_max >= :experienceMin)', { experienceMin });
        }
        if (experienceMax !== undefined) {
            qb.andWhere('(job.experience_min IS NULL OR job.experience_min <= :experienceMax)', { experienceMax });
        }
        if (skills) {
            const skillList = skills.split(',').map((s) => s.trim());
            qb.andWhere('skill.name IN (:...skillList)', { skillList });
        }
        if (sort === 'most_score' && userSkills && userSkills.length > 0) {
            const skillParams = userSkills.map(s => s.toLowerCase());
            qb.addSelect(`(SELECT COUNT(*) FROM job_post_skills jps 
          JOIN skills s ON s.id = jps.skill_id 
          WHERE jps.job_post_id = job.id AND LOWER(s.name) IN (:...userSkills))`, 'match_score');
            qb.setParameter('userSkills', skillParams);
            qb.orderBy('match_score', 'DESC');
            qb.addOrderBy('job.posted_at', 'DESC');
        }
        else if (sort === 'popular') {
            qb.orderBy('job.popularity_score', 'DESC');
        }
        else {
            qb.orderBy('job.posted_at', 'DESC');
        }
        qb.take(take).skip(skip);
        const [jobs, total] = await qb.getManyAndCount();
        return {
            success: true,
            data: {
                jobs,
                pagination: {
                    total,
                    page,
                    limit: take,
                    totalPages: Math.ceil(total / take),
                },
                meta: {
                    window: '24 hours',
                    sort,
                    filters: { search, location, workMode, employmentType, experienceMin, experienceMax, skills },
                },
            },
        };
    }
    async findById(id) {
        const job = await this.jobPostsRepository
            .createQueryBuilder('job')
            .leftJoinAndSelect('job.skills', 'skill')
            .where('job.id = :id', { id })
            .andWhere('job.posted_at >= NOW() - INTERVAL \'24 hours\'')
            .andWhere('job.status = :status', { status: JobStatus.ACTIVE })
            .getOne();
        if (!job) {
            return { success: false, message: 'Job not found or expired', code: 'JOB_NOT_FOUND' };
        }
        return { success: true, data: job };
    }
    async getCount() {
        return this.jobPostsRepository
            .createQueryBuilder('job')
            .where('job.posted_at >= NOW() - INTERVAL \'24 hours\'')
            .andWhere('job.status = :status', { status: JobStatus.ACTIVE })
            .getCount();
    }
    async getRecommendedJobs(userSkills, resumeText) {
        const qb = this.jobPostsRepository
            .createQueryBuilder('job')
            .leftJoinAndSelect('job.skills', 'skill')
            .where('job.posted_at >= NOW() - INTERVAL \'24 hours\'')
            .andWhere('job.status = :status', { status: JobStatus.ACTIVE })
            .andWhere('(job.experience_min IS NULL OR job.experience_min <= 2)')
            .andWhere('(job.experience_max IS NULL OR job.experience_max <= 5)')
            .orderBy('job.posted_at', 'DESC')
            .take(20);
        const jobs = await qb.getMany();
        const scoredJobs = [];
        const safeUserSkills = userSkills && userSkills.length > 0
            ? userSkills
            : ['React', 'TypeScript', 'Node.js'];
        for (const job of jobs) {
            const jobSkills = job.skills ? job.skills.map(s => s.name) : [];
            const aiResult = await this.aiService.analyzeResumeMatch(job.job_title || 'Software Developer', job.description || '', jobSkills, safeUserSkills, resumeText);
            if (aiResult.match_score >= 60) {
                scoredJobs.push({
                    ...job,
                    ai_match: aiResult
                });
            }
        }
        scoredJobs.sort((a, b) => b.ai_match.match_score - a.ai_match.match_score);
        return {
            success: true,
            data: scoredJobs,
            meta: {
                totalEvaluated: jobs.length,
                totalRecommended: scoredJobs.length,
                threshold: 60,
            }
        };
    }
    async seedMockJobs() {
        const count = await this.getCount();
        if (count > 0) {
            console.log('Mock jobs already exist, skipping seed.');
            return;
        }
        const now = new Date();
        const hoursAgo = (h) => new Date(now.getTime() - h * 60 * 60 * 1000);
        const mockJobs = [
            {
                source: 'mock',
                source_post_id: 'mock-001',
                source_url: 'https://example.com/jobs/1',
                author_name: 'ABC Technologies',
                raw_content: 'We are hiring a Backend Developer with Node.js experience.',
                job_title: 'Backend Developer',
                company_name: 'ABC Technologies',
                description: 'We are looking for a skilled Backend Developer proficient in Node.js, NestJS, and PostgreSQL. 0-2 years experience. Hybrid work from Bangalore.',
                location: 'Bangalore',
                work_mode: 'HYBRID',
                employment_type: 'FULL_TIME',
                experience_min: 0,
                experience_max: 2,
                salary_min: 600000,
                salary_max: 1000000,
                salary_currency: 'INR',
                application_email: 'hr@abc.com',
                posted_at: hoursAgo(1),
                likes: 45,
                comments: 12,
                shares: 8,
                popularity_score: 45 * 1 + 12 * 2 + 8 * 3,
                is_job_post: true,
                classification_confidence: 0.97,
                content_hash: 'mock-hash-001',
                status: 'ACTIVE',
            },
            {
                source: 'mock',
                source_post_id: 'mock-002',
                source_url: 'https://example.com/jobs/2',
                author_name: 'XYZ Fintech',
                raw_content: 'Senior React Developer needed immediately. Remote work available.',
                job_title: 'Senior React Developer',
                company_name: 'XYZ Fintech',
                description: 'Looking for a Senior React Developer with TypeScript expertise. 3-5 years experience. Full remote work.',
                location: 'Mumbai',
                work_mode: 'REMOTE',
                employment_type: 'FULL_TIME',
                experience_min: 3,
                experience_max: 5,
                salary_min: 1200000,
                salary_max: 1800000,
                salary_currency: 'INR',
                application_url: 'https://xyz.com/careers/react-dev',
                posted_at: hoursAgo(3),
                likes: 120,
                comments: 35,
                shares: 22,
                popularity_score: 120 * 1 + 35 * 2 + 22 * 3,
                is_job_post: true,
                classification_confidence: 0.99,
                content_hash: 'mock-hash-002',
                status: 'ACTIVE',
            },
            {
                source: 'mock',
                source_post_id: 'mock-003',
                source_url: 'https://example.com/jobs/3',
                author_name: 'DevStudio',
                raw_content: 'Freshers hiring! Java Developer internship position available.',
                job_title: 'Java Developer Intern',
                company_name: 'DevStudio',
                description: 'Exciting internship opportunity for fresher Java developers. Work on real projects with mentorship.',
                location: 'Pune',
                work_mode: 'ONSITE',
                employment_type: 'INTERNSHIP',
                experience_min: 0,
                experience_max: 0,
                salary_min: 15000,
                salary_max: 25000,
                salary_currency: 'INR',
                application_email: 'internship@devstudio.io',
                posted_at: hoursAgo(6),
                likes: 89,
                comments: 28,
                shares: 15,
                popularity_score: 89 * 1 + 28 * 2 + 15 * 3,
                is_job_post: true,
                classification_confidence: 0.94,
                content_hash: 'mock-hash-003',
                status: 'ACTIVE',
            },
            {
                source: 'mock',
                source_post_id: 'mock-004',
                source_url: 'https://example.com/jobs/4',
                author_name: 'CloudOps Inc',
                raw_content: 'DevOps Engineer needed. Kubernetes and AWS experience required.',
                job_title: 'DevOps Engineer',
                company_name: 'CloudOps Inc',
                description: 'We need an experienced DevOps Engineer with strong Kubernetes, AWS, and CI/CD pipeline experience. 2-4 years.',
                location: 'Hyderabad',
                work_mode: 'HYBRID',
                employment_type: 'FULL_TIME',
                experience_min: 2,
                experience_max: 4,
                salary_min: 900000,
                salary_max: 1400000,
                salary_currency: 'INR',
                application_url: 'https://cloudops.com/apply',
                posted_at: hoursAgo(10),
                likes: 67,
                comments: 19,
                shares: 11,
                popularity_score: 67 * 1 + 19 * 2 + 11 * 3,
                is_job_post: true,
                classification_confidence: 0.96,
                content_hash: 'mock-hash-004',
                status: 'ACTIVE',
            },
            {
                source: 'mock',
                source_post_id: 'mock-005',
                source_url: 'https://example.com/jobs/5',
                author_name: 'DataMind AI',
                raw_content: 'ML Engineer opening! Python, TensorFlow experience required. Remote friendly.',
                job_title: 'Machine Learning Engineer',
                company_name: 'DataMind AI',
                description: 'Join our AI team as an ML Engineer. Work on cutting-edge deep learning models. Python, TensorFlow, PyTorch required.',
                location: 'Bangalore',
                work_mode: 'REMOTE',
                employment_type: 'FULL_TIME',
                experience_min: 1,
                experience_max: 3,
                salary_min: 1000000,
                salary_max: 1600000,
                salary_currency: 'INR',
                application_email: 'careers@datamind.ai',
                posted_at: hoursAgo(18),
                likes: 210,
                comments: 55,
                shares: 40,
                popularity_score: 210 * 1 + 55 * 2 + 40 * 3,
                is_job_post: true,
                classification_confidence: 0.98,
                content_hash: 'mock-hash-005',
                status: 'ACTIVE',
            },
            {
                source: 'mock',
                source_post_id: 'mock-006',
                source_url: 'https://example.com/jobs/6',
                author_name: 'WebCraft Solutions',
                raw_content: 'Full Stack Developer with React and Node.js needed. Immediate joining.',
                job_title: 'Full Stack Developer',
                company_name: 'WebCraft Solutions',
                description: 'Looking for Full Stack Developer with React.js and Node.js expertise. Must have TypeScript knowledge. Hybrid work.',
                location: 'Chennai',
                work_mode: 'HYBRID',
                employment_type: 'FULL_TIME',
                experience_min: 1,
                experience_max: 4,
                salary_min: 700000,
                salary_max: 1200000,
                salary_currency: 'INR',
                application_email: 'jobs@webcraft.dev',
                posted_at: hoursAgo(22),
                likes: 55,
                comments: 14,
                shares: 9,
                popularity_score: 55 * 1 + 14 * 2 + 9 * 3,
                is_job_post: true,
                classification_confidence: 0.95,
                content_hash: 'mock-hash-006',
                status: 'ACTIVE',
            },
        ];
        for (const job of mockJobs) {
            const existing = await this.jobPostsRepository.findOne({
                where: { source: job.source, source_post_id: job.source_post_id },
            });
            if (!existing) {
                await this.jobPostsRepository.save(this.jobPostsRepository.create(job));
            }
        }
        console.log('✅ Mock jobs seeded successfully.');
    }
};
JobsService = __decorate([
    Injectable(),
    __param(0, InjectRepository(JobPost)),
    __param(1, Inject(forwardRef(() => AIService))),
    __metadata("design:paramtypes", [Repository,
        AIService])
], JobsService);
export { JobsService };
//# sourceMappingURL=jobs.service.js.map