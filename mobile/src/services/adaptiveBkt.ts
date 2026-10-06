export interface SkillMasteryItem {
  skillId: string;
  skillName: string;
  category: 'WILDERNESS' | 'FIRE_ELECTRICAL' | 'FIRST_AID' | 'BODY_SAFETY' | 'WATER_SAFETY';
  masteryProbability: number; // 0.0 to 1.0 (e.g. 0.94 = 94% mastered)
  reflexSpeedLevel: 'UNCONSCIOUS_REFLEX' | 'PROFICIENT' | 'HESITANT';
  averageReactionTimeMs: number;
  recommendation: string;
}

class BayesianKnowledgeTracingEngine {
  private readonly P_TRANSITION = 0.12; // Xác suất học được sau 1 lần làm bài
  private readonly P_GUESS = 0.14; // Xác suất đoán mò
  private readonly P_SLIP = 0.06; // Xác suất lỡ tay sơ suất

  /**
   * Tính toán xác suất làm chủ kỹ năng theo công thức Bayesian Knowledge Tracing
   */
  public updateMasteryProbability(
    priorProb: number,
    isCorrect: boolean,
    reactionTimeMs: number,
  ): number {
    let pPosterior = priorProb;

    if (isCorrect) {
      // Bé trả lời đúng
      const numerator = priorProb * (1 - this.P_SLIP);
      const denominator = priorProb * (1 - this.P_SLIP) + (1 - priorProb) * this.P_GUESS;
      pPosterior = numerator / Math.max(0.01, denominator);
    } else {
      // Bé trả lời sai
      const numerator = priorProb * this.P_SLIP;
      const denominator = priorProb * this.P_SLIP + (1 - priorProb) * (1 - this.P_GUESS);
      pPosterior = numerator / Math.max(0.01, denominator);
    }

    // Tăng xác suất chuyển tiếp
    const updatedProb = pPosterior + (1 - pPosterior) * this.P_TRANSITION;

    // Hiệu chỉnh theo thời gian phản xạ (Reaction time factor)
    const timeFactor = reactionTimeMs <= 2500 ? 1.05 : reactionTimeMs > 6000 ? 0.92 : 1.0;
    return Math.min(0.99, Math.max(0.1, parseFloat((updatedProb * timeFactor).toFixed(2))));
  }

  /**
   * Tổng hợp Bảng Chỉ Số BKT Đa Kỹ Năng cho Báo Cáo Phụ Huynh
   */
  public getSampleMasteryBreakdown(): SkillMasteryItem[] {
    return [
      {
        skillId: 'bkt_tree',
        skillName: 'Ôm Cây Hug-a-Tree & Thổi Còi',
        category: 'WILDERNESS',
        masteryProbability: 0.96,
        reflexSpeedLevel: 'UNCONSCIOUS_REFLEX',
        averageReactionTimeMs: 1900,
        recommendation: 'Phản xạ vô thức xuất sắc (<2.0s). Bé nhớ rất sâu kỹ năng.',
      },
      {
        skillId: 'bkt_smoke',
        skillName: 'Bò Thấp Dưới Tầng Khói Độc',
        category: 'FIRE_ELECTRICAL',
        masteryProbability: 0.82,
        reflexSpeedLevel: 'PROFICIENT',
        averageReactionTimeMs: 3800,
        recommendation: 'Bé đã nắm vững lý thuyết. Cần diễn tập bò thực tế thêm 1 lần tại nhà.',
      },
      {
        skillId: 'bkt_safe_word',
        skillName: 'Mật Mã Bí Mật (Safe Word) Phòng Bắt Cóc',
        category: 'BODY_SAFETY',
        masteryProbability: 0.74,
        reflexSpeedLevel: 'HESITANT',
        averageReactionTimeMs: 6200,
        recommendation: 'Thời gian ngập ngừng >6s. Ba mẹ nên nhắc lại mật mã gia đình cùng bé.',
      },
      {
        skillId: 'bkt_burn',
        skillName: 'Xả Nước Mát Trị Bỏng 15-20 Phút',
        category: 'FIRST_AID',
        masteryProbability: 0.91,
        reflexSpeedLevel: 'UNCONSCIOUS_REFLEX',
        averageReactionTimeMs: 2300,
        recommendation: 'Bé nhớ chính xác quy tắc không bôi kem đánh răng.',
      },
    ];
  }
}

export const bktEngine = new BayesianKnowledgeTracingEngine();
