import { Controller, Get, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { SavedJobsService } from './saved-jobs.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('api/saved-jobs')
export class SavedJobsController {
  constructor(private readonly savedJobsService: SavedJobsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.savedJobsService.findAllByUser(req.user.id);
  }

  @Post(':jobId')
  save(@Request() req: any, @Param('jobId') jobId: string) {
    return this.savedJobsService.save(req.user.id, jobId);
  }

  @Delete(':jobId')
  remove(@Request() req: any, @Param('jobId') jobId: string) {
    return this.savedJobsService.remove(req.user.id, jobId);
  }
}
