import { Injectable } from '@nestjs/common';

/**
 * PopularityService — isolated so the formula can change without touching other services.
 * Formula: likes × 1 + comments × 2 + shares × 3
 */
@Injectable()
export class PopularityService {
  calculate(likes: number, comments: number, shares: number): number {
    return likes * 1 + comments * 2 + shares * 3;
  }
}
