import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ApplicationStatus } from './entities/application.entity.js';

@UseGuards(JwtAuthGuard)
@Controller('api/applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.applicationsService.findAllByUser(req.user.id);
  }

  @Post()
  create(@Request() req: any, @Body() body: { jobPostId: string; notes?: string }) {
    return this.applicationsService.create(req.user.id, body);
  }

  @Patch(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { status?: ApplicationStatus; notes?: string },
  ) {
    return this.applicationsService.update(req.user.id, id, body);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.applicationsService.remove(req.user.id, id);
  }
}
