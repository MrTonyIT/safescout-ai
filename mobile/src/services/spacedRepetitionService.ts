import { Platform } from 'react-native';

export interface SrsQuestionOption {
  id: string;
  testQuestionId?: string;
  optionText: string;
  displayOrder?: number;
  isCorrect?: boolean;
}

export interface SpacedRepetitionItem {
  questionId: string;
  promptText: string;
  zoneNumber: number;
  checkpointId: string;
  lessonTitle: string;
  questionType: 'REFLEX_SPEED' | 'SINGLE_CHOICE' | 'DRAG_DROP_ORDER';
  hazardLevel: 'SAFE' | 'CAUTION' | 'CRITICAL_EMERGENCY';
  timeLimitSeconds: number;
  explanation: string;
  options: SrsQuestionOption[];
  // Dữ liệu thuật toán SuperMemo-2
  repetitionCount: number;
  easeFactor: number; // Mặc định 2.5
  intervalDays: number;
  lastReviewedAt: number;
  nextReviewAt: number;
  stabilityScore: number; // 0 - 100% độ bền trí nhớ
  isMastered: boolean;
  history: Array<{
    timestamp: number;
    wasCorrect: boolean;
    responseTimeMs: number;
    qualityRating: number;
  }>;
}

const SRS_STORAGE_KEY = 'milo_spaced_repetition_items_v1';
let srsMemoryCache: Record<string, SpacedRepetitionItem> = {};

class SpacedRepetitionEngine {
  constructor() {
    this.loadFromStorage();
  }

  private async loadFromStorage() {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(SRS_STORAGE_KEY);
        if (raw) {
          srsMemoryCache = JSON.parse(raw);
        }
      }
    } catch (e) {
      console.log('Error loading SRS data:', e);
    }
  }

  private async persistToStorage() {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(SRS_STORAGE_KEY, JSON.stringify(srsMemoryCache));
      }
    } catch (e) {
      console.log('Error saving SRS data:', e);
    }
  }

  // --- 1. GHI NHẬN CÂU HỎI LÀM SAI VÀO HÀNG ĐỢI SRS ---
  async recordMistake(
    question: {
      id: string;
      promptText: string;
      questionType?: string;
      hazardLevel?: string;
      timeLimitSeconds?: number;
      explanation?: string;
      options: SrsQuestionOption[];
    },
    zoneNumber: number,
    checkpointId: string,
    lessonTitle: string,
  ): Promise<SpacedRepetitionItem> {
    const existing = srsMemoryCache[question.id];
    const now = Date.now();

    if (existing) {
      existing.repetitionCount = 0;
      existing.intervalDays = 1;
      existing.nextReviewAt = now + 1 * 24 * 60 * 60 * 1000;
      existing.stabilityScore = Math.max(10, existing.stabilityScore - 30);
      existing.isMastered = false;
      existing.lastReviewedAt = now;
      existing.history.push({
        timestamp: now,
        wasCorrect: false,
        responseTimeMs: 0,
        qualityRating: 1,
      });
      await this.persistToStorage();
      return existing;
    }

    const newItem: SpacedRepetitionItem = {
      questionId: question.id,
      promptText: question.promptText,
      zoneNumber,
      checkpointId,
      lessonTitle,
      questionType: (question.questionType as any) || 'SINGLE_CHOICE',
      hazardLevel: (question.hazardLevel as any) || 'SAFE',
      timeLimitSeconds: question.timeLimitSeconds || 10,
      explanation: question.explanation || 'Luôn chú ý an toàn và làm theo hướng dẫn của Đội Trưởng Milo!',
      options: question.options,
      repetitionCount: 0,
      easeFactor: 2.5,
      intervalDays: 1,
      lastReviewedAt: now,
      nextReviewAt: now + 1 * 24 * 60 * 60 * 1000,
      stabilityScore: 20,
      isMastered: false,
      history: [
        {
          timestamp: now,
          wasCorrect: false,
          responseTimeMs: 0,
          qualityRating: 1,
        },
      ],
    };

    srsMemoryCache[question.id] = newItem;
    await this.persistToStorage();
    return newItem;
  }

  // --- 2. GHI NHẬN KẾT QUẢ ÔN TẬP & TÍNH TOÁN KHOẢNG CÁCH NGẮT QUÃNG TIẾP THEO ---
  async recordReviewResult(
    questionId: string,
    wasCorrect: boolean,
    responseTimeMs: number = 3000,
  ): Promise<SpacedRepetitionItem | null> {
    const item = srsMemoryCache[questionId];
    if (!item) return null;

    const now = Date.now();

    // Tính điểm chất lượng Quality Rating q (0 - 5)
    let q = 1;
    if (wasCorrect) {
      if (responseTimeMs < 4000) q = 5; // Phản xạ cực nhanh
      else if (responseTimeMs < 8000) q = 4; // Tốt
      else q = 3; // Đúng nhưng còn chần chừ
    } else {
      q = responseTimeMs > 6000 ? 1 : 2;
    }

    // Thuật toán SM-2 cập nhật Ease Factor EF
    let ef = item.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    ef = Math.max(1.3, Math.min(3.0, ef));
    item.easeFactor = Number(ef.toFixed(2));

    if (q >= 3) {
      // Bé trả lời đúng
      if (item.repetitionCount === 0) {
        item.intervalDays = 1;
      } else if (item.repetitionCount === 1) {
        item.intervalDays = 3;
      } else {
        item.intervalDays = Math.round(item.intervalDays * item.easeFactor);
      }
      item.repetitionCount += 1;
      item.stabilityScore = Math.min(100, item.stabilityScore + 25);
      if (item.repetitionCount >= 3 && item.stabilityScore >= 80) {
        item.isMastered = true;
      }
    } else {
      // Bé trả lời sai -> Reset chu kỳ
      item.repetitionCount = 0;
      item.intervalDays = 1;
      item.stabilityScore = Math.max(15, item.stabilityScore - 25);
      item.isMastered = false;
    }

    item.lastReviewedAt = now;
    item.nextReviewAt = now + item.intervalDays * 24 * 60 * 60 * 1000;
    item.history.push({
      timestamp: now,
      wasCorrect,
      responseTimeMs,
      qualityRating: q,
    });

    await this.persistToStorage();
    return item;
  }

  // --- 3. LẤY CÁC CÂU HỎI ĐẾN HẠN CẦN ÔN TẬP ---
  getDueQuestions(limit: number = 2): SpacedRepetitionItem[] {
    const all = Object.values(srsMemoryCache);
    const now = Date.now();

    // Sắp xếp ưu tiên câu chưa thành thạo và đến hạn ôn tập
    return all
      .filter((item) => !item.isMastered || item.nextReviewAt <= now)
      .sort((a, b) => a.stabilityScore - b.stabilityScore)
      .slice(0, limit);
  }

  // --- 4. TỰ ĐỘNG LỒNG GHÉP CÂU ÔN TẬP VÀO BÀI TEST CHẶNG MỚI ---
  interleaveSrsQuestions(baseQuestions: any[]): any[] {
    const dueItems = this.getDueQuestions(1);
    if (dueItems.length === 0) return baseQuestions;

    const srsItem = dueItems[0];
    // Tránh trùng lặp câu hỏi
    const isDuplicate = baseQuestions.some((q) => q.id === srsItem.questionId);
    if (isDuplicate) return baseQuestions;

    // Chuyển format thành câu hỏi bài test kèm cờ isSrsReview
    const reviewQuestion = {
      id: srsItem.questionId,
      questionNumber: baseQuestions.length + 1,
      promptText: `🔄 [ÔN TẬP PHẢN XẠ MILO]: ${srsItem.promptText.replace(/^[^:]+:\s*/, '')}`,
      questionType: srsItem.questionType,
      hazardLevel: srsItem.hazardLevel,
      timeLimitSeconds: srsItem.timeLimitSeconds,
      explanation: srsItem.explanation,
      options: srsItem.options,
      isSrsReview: true,
      stabilityScore: srsItem.stabilityScore,
    };

    // Chèn vào vị trí câu số 2 trong đề
    const result = [...baseQuestions];
    if (result.length >= 2) {
      result.splice(1, 0, reviewQuestion);
    } else {
      result.push(reviewQuestion);
    }

    // Đánh số thứ tự lại
    return result.map((q, idx) => ({ ...q, questionNumber: idx + 1 }));
  }

  getAllItems(): SpacedRepetitionItem[] {
    return Object.values(srsMemoryCache);
  }

  getMasteryRate(): number {
    const all = Object.values(srsMemoryCache);
    if (all.length === 0) return 100;
    const mastered = all.filter((i) => i.isMastered).length;
    return Math.round((mastered / all.length) * 100);
  }
}

export const spacedRepetition = new SpacedRepetitionEngine();
