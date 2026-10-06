import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SrsCalculationResult {
  easeFactor: number;
  intervalDays: number;
  stabilityScore: number;
  isMastered: boolean;
  nextReviewAt: Date;
}

@Injectable()
export class SpacedRepetitionService {
  private readonly logger = new Logger(SpacedRepetitionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tính toán khoảng thời gian lặp lại tối ưu theo thuật toán SuperMemo-2 (SM-2)
   */
  calculateNextReview(
    currentEaseFactor: number = 2.5,
    currentRepetitionCount: number = 0,
    currentIntervalDays: number = 1,
    currentStabilityScore: number = 20,
    wasCorrect: boolean = true,
    responseTimeMs: number = 3000,
  ): SrsCalculationResult {
    // 1. Xác định thang chất lượng phản xạ (0 - 5)
    let q = 1;
    if (wasCorrect) {
      if (responseTimeMs < 4000) q = 5; // Phản xạ thần tốc
      else if (responseTimeMs < 8000) q = 4; // Phản xạ chuẩn
      else q = 3; // Đúng nhưng còn do dự
    } else {
      q = responseTimeMs > 6000 ? 1 : 2;
    }

    // 2. Cập nhật Ease Factor
    let ef = currentEaseFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    ef = Math.max(1.3, Math.min(3.0, ef));
    const easeFactor = Number(ef.toFixed(2));

    let repetitionCount = currentRepetitionCount;
    let intervalDays = currentIntervalDays;
    let stabilityScore = currentStabilityScore;
    let isMastered = false;

    if (q >= 3) {
      if (repetitionCount === 0) {
        intervalDays = 1;
      } else if (repetitionCount === 1) {
        intervalDays = 3;
      } else {
        intervalDays = Math.round(intervalDays * easeFactor);
      }
      repetitionCount += 1;
      stabilityScore = Math.min(100, stabilityScore + 25);
      if (repetitionCount >= 3 && stabilityScore >= 80) {
        isMastered = true;
      }
    } else {
      repetitionCount = 0;
      intervalDays = 1;
      stabilityScore = Math.max(15, stabilityScore - 25);
      isMastered = false;
    }

    const nextReviewAt = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);

    return {
      easeFactor,
      intervalDays,
      stabilityScore,
      isMastered,
      nextReviewAt,
    };
  }

  /**
   * Lấy danh sách câu hỏi đến hạn ôn tập của học viên
   */
  async getDueQuestionsForUser(userId: string, limit: number = 3) {
    try {
      const mistakes = await this.prisma.mistakeLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
      return mistakes;
    } catch (e) {
      this.logger.warn(`Could not fetch mistake logs for user ${userId}: ${e.message}`);
      return [];
    }
  }
}
