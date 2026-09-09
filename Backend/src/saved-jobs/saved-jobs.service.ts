import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedJob } from '../jobs/entities/saved-job.entity.js';

@Injectable()
export class SavedJobsService {
  constructor(
    @InjectRepository(SavedJob)
    private savedJobsRepository: Repository<SavedJob>,
  ) {}

  async findAllByUser(userId: string) {
    const saved = await this.savedJobsRepository.find({
      where: { user: { id: userId } },
      relations: { jobPost: { skills: true } },
      order: { created_at: 'DESC' },
    });
    return { success: true, data: saved };
  }

  async save(userId: string, jobPostId: string) {
    const existing = await this.savedJobsRepository.findOne({
      where: { user: { id: userId }, jobPost: { id: jobPostId } },
    });
    if (existing) {
      throw new ConflictException('Job already saved');
    }
    const savedJob = this.savedJobsRepository.create({
      user: { id: userId } as any,
      jobPost: { id: jobPostId } as any,
    });
    const result = await this.savedJobsRepository.save(savedJob);
    return { success: true, data: result };
  }

  async remove(userId: string, jobPostId: string) {
    const savedJob = await this.savedJobsRepository.findOne({
      where: { user: { id: userId }, jobPost: { id: jobPostId } },
    });
    if (!savedJob) throw new NotFoundException('Saved job not found');
    await this.savedJobsRepository.remove(savedJob);
    return { success: true, message: 'Job unsaved successfully' };
  }
}
