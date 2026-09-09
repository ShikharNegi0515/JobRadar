import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Optional,
  NotFoundException,
} from '@nestjs/common';
import { JobsService } from './jobs.service.js';

@Controller('api/jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('sort') sort: 'recent' | 'popular' = 'recent',
    @Query('location') location?: string,
    @Query('workMode') workMode?: string,
    @Query('employmentType') employmentType?: string,
    @Query('experienceMin') experienceMin?: string,
    @Query('experienceMax') experienceMax?: string,
    @Query('skills') skills?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    return this.jobsService.findAll({
      search,
      sort,
      location,
      workMode,
      employmentType,
      experienceMin: experienceMin ? parseInt(experienceMin, 10) : undefined,
      experienceMax: experienceMax ? parseInt(experienceMax, 10) : undefined,
      skills,
      page,
      limit,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.jobsService.findById(id);
    if (!result.success) {
      throw new NotFoundException(result.message);
    }
    return result;
  }
}
