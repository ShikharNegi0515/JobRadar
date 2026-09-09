import { Controller, Get, UseGuards } from '@nestjs/common';
import { SkillsService } from './skills.service.js';

@Controller('api/skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  async findAll() {
    const skills = await this.skillsService.findAll();
    return { success: true, data: skills };
  }
}
