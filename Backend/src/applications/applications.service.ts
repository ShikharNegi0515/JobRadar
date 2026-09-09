import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from './entities/application.entity.js';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
  ) {}

  async findAllByUser(userId: string) {
    const apps = await this.applicationsRepository.find({
      where: { user: { id: userId } },
      relations: { jobPost: { skills: true } },
      order: { created_at: 'DESC' },
    });
    return { success: true, data: apps };
  }

  async create(userId: string, createDto: { jobPostId: string; notes?: string }) {
    const app = this.applicationsRepository.create({
      user: { id: userId } as any,
      jobPost: { id: createDto.jobPostId } as any,
      status: ApplicationStatus.INTERESTED,
      notes: createDto.notes,
    });
    const saved = await this.applicationsRepository.save(app);
    return { success: true, data: saved };
  }

  async update(userId: string, id: string, updateDto: { status?: ApplicationStatus; notes?: string }) {
    const app = await this.applicationsRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!app) throw new NotFoundException('Application not found');
    Object.assign(app, updateDto);
    if (updateDto.status === ApplicationStatus.APPLIED && !app.applied_at) {
      app.applied_at = new Date();
    }
    const saved = await this.applicationsRepository.save(app);
    return { success: true, data: saved };
  }

  async remove(userId: string, id: string) {
    const app = await this.applicationsRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!app) throw new NotFoundException('Application not found');
    await this.applicationsRepository.remove(app);
    return { success: true, message: 'Application removed' };
  }
}
