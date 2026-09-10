import { Controller, Post, Get, UseGuards, Body } from '@nestjs/common';
import { IngestionService } from './ingestion.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('api/ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  /**
   * Manually trigger an ingestion run (for testing/admin)
   * Accepts optional `keywords` array or `resumeText` string for personalized scraping
   */
  @Post('trigger')
  async triggerIngestion(
    @Body('keywords') keywords?: string[],
    @Body('resumeText') resumeText?: string,
  ) {
    const result = await this.ingestionService.runIngestion(keywords, resumeText);
    return {
      success: true,
      message: 'Ingestion completed',
      data: result,
    };
  }

  /**
   * Manually trigger job expiry
   */
  @Post('expire')
  async triggerExpiry() {
    await this.ingestionService.expireOldJobs();
    return { success: true, message: 'Expiry job run' };
  }
}
