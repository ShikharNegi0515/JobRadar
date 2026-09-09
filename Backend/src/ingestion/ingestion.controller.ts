import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { IngestionService } from './ingestion.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('api/ingestion')
@UseGuards(JwtAuthGuard)
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  /**
   * Manually trigger an ingestion run (for testing/admin)
   */
  @Post('trigger')
  async triggerIngestion() {
    const result = await this.ingestionService.runIngestion();
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
