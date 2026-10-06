import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitCheckpointTestDto } from './dto/submit-test.dto';
import { parseLessonGuide } from './lesson-guide';
import { MiloAiResponse, MiloEmotion, HazardLevel } from '../ai/interfaces/milo-response.interface';

@Injectable()
export class LearningService {
  private readonly logger = new Logger(LearningService.name);

  constructor(private readonly prisma: PrismaService) {}

  validCheckpoint(content: any): boolean {
    return content.questions.length > 0 && content.questions.length <= 100 && content.passScoreThreshold > 0 && content.passScoreThreshold <= 100 && content.questions.every((q: any) => {
      if (!q.promptText?.trim() || !q.explanation?.trim() || q.options.length > 100 || q.options.some((o: any)=>!o.optionText?.trim())) return false;
      const correct = q.options.filter((o: any) => o.isCorrect);
      if (q.questionType === 'DRAG_DROP_ORDER') return q.options.length > 0 && correct.length === q.options.length && new Set(q.options.map((o: any) => o.displayOrder)).size === q.options.length;
      return ['SINGLE_CHOICE','TIMED_REFLEX'].includes(q.questionType) && correct.length === 1 && q.options.length >= 1;
    });
  }

  fingerprint(content: any): string {
    const normalized = {id:content.id,title:content.title,description:content.description,passScoreThreshold:content.passScoreThreshold,timeLimitSeconds:content.timeLimitSeconds,
      lesson:content.lesson?{id:content.lesson.id,title:content.lesson.title,description:content.lesson.description,content:content.lesson.contentJson}:null,
      questions:[...content.questions].sort((a,b)=>a.id.localeCompare(b.id)).map(q=>({id:q.id,prompt:q.promptText,type:q.questionType,explanation:q.explanation,hazard:q.hazardLevel,time:q.timeLimitSeconds,order:q.orderIndex,
        options:[...q.options].sort((a,b)=>a.id.localeCompare(b.id)).map(o=>({id:o.id,text:o.optionText,correct:o.isCorrect,order:o.displayOrder}))}))};
    return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
  }

  private async contentVersion(checkpointId: string): Promise<string> {
    const content = await this.prisma.checkpoint.findUnique({where:{id:checkpointId},include:{lesson:true,questions:{orderBy:{id:'asc'},include:{options:{orderBy:{id:'asc'}}}}}});
    if (!content) throw new NotFoundException('Bài học không còn tồn tại.');
    return this.fingerprint(content);
  }

  private async requireUnlocked(userId: string | undefined, checkpointId: string) {
    if (!userId) throw new BadRequestException('Cần hồ sơ học thử.');
    const map = await this.getJourneyMap(userId);
    for (const zone of map.zones) for (const stage of zone.stages) for (const lesson of stage.lessons) {
      if (lesson.checkpointIds.includes(checkpointId)) {
        if (!lesson.isAvailable) throw new ConflictException('Bài này chưa có nội dung hợp lệ để học.');
        if (!zone.isUnlocked || lesson.status === 'LOCKED') throw new ForbiddenException('Hãy hoàn thành bài trước để mở bài này.');
        return;
      }
    }
    throw new NotFoundException('Bài học không còn tồn tại.');
  }

  /**
   * Lấy cấu trúc toàn bộ 10 Vùng Đất Sinh Tồn và trạng thái mở khóa bài học theo UserId
   */
  async getJourneyMap(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        lessonProgress: true,
        userBadges: {
          include: { badge: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Không tìm thấy thông tin học viên với ID: ${userId}`);
    }

    const zones = await this.prisma.zone.findMany({
      orderBy: { zoneNumber: 'asc' },
      include: {
        stages: {
          orderBy: { stageNumber: 'asc' },
          include: {
            lessons: {
              orderBy: { lessonNumber: 'asc' },
              include: {
                checkpoints: {
                  orderBy: { checkpointNumber: 'asc' },
                  include: {questions: {include: {options: true}}},
                },
              },
            },
          },
        },
        badges: true,
      },
    });

    const progressMap = new Map(user.lessonProgress.map((p) => [p.lessonId, p]));
    let totalLessonsCount = 0;
    let completedLessonsCount = 0;

    const passedResults = await this.prisma.testResult.findMany({where:{userId,isPassed:true},select:{checkpointId:true,contentVersion:true}});
    const versions = new Map(zones.flatMap(z=>z.stages.flatMap(s=>s.lessons.flatMap(l=>l.checkpoints.map(c=>[c.id,this.fingerprint({...c,lesson:l})] as const)))));
    const approvals = user.familyId ? await this.prisma.contentApproval.findMany({where:{status:'PUBLISHED',ageMin:{lte:user.age},ageMax:{gte:user.age}}}) : [];
    const approved = new Set(approvals.filter(a=>a.reviewer && a.source && a.reviewedAt && a.contentVersion===versions.get(a.checkpointId)).map(a=>a.checkpointId));
    const passedIds = new Set(passedResults.filter(r=>r.contentVersion === versions.get(r.checkpointId)).map(r => r.checkpointId));
    let isPreviousLessonCompleted = true;
    const mappedZones = zones.map((zone) => {
      const zoneUnlocked = isPreviousLessonCompleted;

      const stages = zone.stages.map((stage) => {
        const lessons = stage.lessons.map((lesson) => {
          const isAvailable = lesson.checkpoints.length > 0 && lesson.checkpoints.every(cp=>this.validCheckpoint(cp) && (!user.familyId || approved.has(cp.id)));
          if (isAvailable) totalLessonsCount++;
          const userProg = progressMap.get(lesson.id);

          let status: 'LOCKED' | 'UNLOCKED' | 'IN_PROGRESS' | 'COMPLETED' = 'LOCKED';
          let score = 0;
          let stars = 0;

          const complete = isAvailable && lesson.checkpoints.every(cp => passedIds.has(cp.id));
          if (userProg) {
            score = userProg.score;
            stars = userProg.stars;
          }
          if (complete) { status = 'COMPLETED'; completedLessonsCount++; }
          else if (isAvailable && isPreviousLessonCompleted) status = lesson.checkpoints.some(cp => passedIds.has(cp.id)) ? 'IN_PROGRESS' : 'UNLOCKED';

          // Cập nhật trạng thái cho bài học kế tiếp
          if (isAvailable) isPreviousLessonCompleted = isPreviousLessonCompleted && complete;

          return {
            id: lesson.id,
            lessonNumber: lesson.lessonNumber,
            title: lesson.title,
            description: lesson.description,
            lessonType: lesson.lessonType,
            durationMinutes: lesson.durationMinutes,
            rewardXp: lesson.rewardXp,
            badgeShardName: lesson.badgeShardName,
            status,
            isAvailable,
            score,
            stars,
            checkpointsCount: lesson.checkpoints.length,
            checkpointIds: lesson.checkpoints.map((cp) => cp.id),
            completedCheckpointIds: lesson.checkpoints.filter(cp => passedIds.has(cp.id)).map(cp => cp.id),
          };
        });

        return {
          id: stage.id,
          stageNumber: stage.stageNumber,
          title: stage.title,
          description: stage.description,
          lessons: user.familyId ? lessons.filter(l=>l.isAvailable) : lessons,
        };
      });

      const zoneBadge = zone.badges[0] || null;
      const userBadgeRecord = zoneBadge ? user.userBadges.find((ub) => ub.badgeId === zoneBadge.id) : null;

      return {
        id: zone.id,
        zoneNumber: zone.zoneNumber,
        title: zone.title,
        description: zone.description,
        iconName: zone.iconName,
        themeColor: zone.themeColor,
        isUnlocked: zoneUnlocked,
        badge: zoneBadge
          ? {
              name: zoneBadge.name,
              code: zoneBadge.code,
              iconUrl: zoneBadge.iconUrl,
              requiredShards: zoneBadge.requiredShardsCount,
              collectedShards: userBadgeRecord ? userBadgeRecord.collectedShards : 0,
              isUnlocked: userBadgeRecord ? userBadgeRecord.isUnlocked : false,
            }
          : null,
        stages: user.familyId ? stages.filter(s=>s.lessons.length>0) : stages,
      };
    });

    const completionRate = totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;

    return {
      user: {
        id: user.id,
        nickname: user.nickname,
        age: user.age,
        ageGroup: user.ageGroup,
        explorerLevel: user.explorerLevel,
        totalSafetyScore: user.totalSafetyScore,
        totalBadges: user.totalBadges,
        completionRate,
      },
      zones: user.familyId ? mappedZones.filter(z=>z.stages.length>0) : mappedZones,
    };
  }

  /**
   * Lấy chi tiết bài kiểm tra phản xạ của một Checkpoint (Bảo mật: Ẩn đáp án đúng)
   */
  async getCheckpointDetails(checkpointId: string, userId?: string) {
    await this.requireUnlocked(userId, checkpointId);
    const checkpoint = await this.prisma.checkpoint.findUnique({
      where: { id: checkpointId },
      include: {
        lesson: {
          include: {
            stage: {
              include: {
                zone: true,
              },
            },
          },
        },
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            options: {
              orderBy: { displayOrder: 'asc' },
              select: {
                id: true,
                testQuestionId: true,
                optionText: true,
                displayOrder: true,
                isCorrect: true,
                // Used for the fingerprint; stripped from the public options below.
              },
            },
          },
        },
      },
    });

    if (!checkpoint) {
      throw new NotFoundException(`Không tìm thấy Checkpoint với ID: ${checkpointId}`);
    }

    return {
      id: checkpoint.id,
      contentVersion: this.fingerprint(checkpoint),
      checkpointNumber: checkpoint.checkpointNumber,
      title: checkpoint.title,
      description: checkpoint.description,
      passScoreThreshold: checkpoint.passScoreThreshold,
      timeLimitSeconds: checkpoint.timeLimitSeconds,
      badgeShardReward: checkpoint.badgeShardReward,
      zoneTitle: checkpoint.lesson.stage.zone.title,
      lessonTitle: checkpoint.lesson.title,
      learningContent: parseLessonGuide(checkpoint.lesson.contentJson),
      totalQuestions: checkpoint.questions.length,
      questions: checkpoint.questions.map((q) => ({
        id: q.id,
        questionNumber: q.questionNumber,
        promptText: q.promptText,
        questionType: q.questionType,
        hazardLevel: q.hazardLevel,
        timeLimitSeconds: q.timeLimitSeconds,
        explanation: q.explanation,
        options: q.options.map(({isCorrect, ...option}) => option),
      })),
    };
  }

  /**
   * Chấm điểm bài kiểm tra phản xạ đếm ngược, lưu log lỗi sai và cấp mảnh huy hiệu
   */
  async submitCheckpointTest(userId: string, checkpointId: string, submitDto: SubmitCheckpointTestDto) {
    const requestHash = createHash('sha256').update(JSON.stringify({ userId, checkpointId, version: submitDto.contentVersion, answers: submitDto.answers, time: submitDto.totalTimeTakenSeconds })).digest('hex');
    return this.prisma.$transaction(async (tx) => {
      const previous = await tx.testResult.findUnique({ where: { id: submitDto.attemptId } });
      if (previous) {
        if (previous.userId !== userId || previous.checkpointId !== checkpointId || previous.requestHash !== requestHash || !previous.responseJson) {
          throw new ConflictException('Mã lần làm bài đã được sử dụng cho dữ liệu khác.');
        }
        const receipt = JSON.parse(previous.responseJson);
        const service = new LearningService(tx as unknown as PrismaService);
        let current = false;
        try {
          await service.requireUnlocked(userId,checkpointId);
          current = previous.contentVersion === await service.contentVersion(checkpointId);
        } catch (error) {
          if (!(error instanceof NotFoundException || error instanceof ForbiddenException || error instanceof ConflictException)) throw error;
        }
        if (!current) return {...receipt,contentRetired:true,review:[],mistakes:[],miloResponse:{...receipt.miloResponse,
          speech:'Đây là kết quả đã lưu trước đây. Nội dung này đã thay đổi hoặc không còn được mở; hãy về danh sách bài để học bản đang được phép sử dụng.',actionRequired:null}};
        return receipt;
      }
      const service = new LearningService(tx as unknown as PrismaService);
      await service.requireUnlocked(userId, checkpointId);
      if (submitDto.contentVersion !== await service.contentVersion(checkpointId)) throw new ConflictException('Nội dung bài đã thay đổi. Giữ bài cũ để đối chiếu và tải lại đề trước khi làm lần mới.');
      const result = await service.gradeAndSave(userId, checkpointId, submitDto);
      await tx.testResult.update({ where: { id: result.testResultId }, data: { requestHash, responseJson: JSON.stringify(result) } });
      return result;
    });
  }

  private async gradeAndSave(userId: string, checkpointId: string, submitDto: SubmitCheckpointTestDto) {
    const { answers, totalTimeTakenSeconds } = submitDto;

    // 1. Kiểm tra tồn tại User và Checkpoint
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy học viên với ID: ${userId}`);
    }

    const checkpoint = await this.prisma.checkpoint.findUnique({
      where: { id: checkpointId },
      include: {
        lesson: {
          include: {
            stage: {
              include: {
                zone: {
                  include: {
                    badges: true,
                  },
                },
              },
            },
          },
        },
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!checkpoint) {
      throw new NotFoundException(`Không tìm thấy Checkpoint với ID: ${checkpointId}`);
    }

    // 2. Chấm điểm từng câu hỏi
    const totalQuestions = checkpoint.questions.length;
    if (!totalQuestions) throw new BadRequestException('Bài học chưa có câu hỏi.');
    const expectedIds = new Set(checkpoint.questions.map((q) => q.id));
    if (new Set(answers.map((a) => a.questionId)).size !== answers.length || answers.some((a) => !expectedIds.has(a.questionId))) {
      throw new BadRequestException('Câu trả lời bị trùng hoặc không thuộc bài kiểm tra.');
    }
    const previousProgress = await this.prisma.userLessonProgress.findUnique({ where: { userId_lessonId: { userId, lessonId: checkpoint.lessonId } } });
    let correctCount = 0;
    const mistakesToLog: Array<{
      questionId: string;
      selectedOptionId?: string;
      userInputOrder?: string;
      responseTimeMs: number;
      miloGuidance: string;
    }> = [];

    const answerMap = new Map(answers.map((a) => [a.questionId, a]));

    for (const question of checkpoint.questions) {
      const submitted = answerMap.get(question.id);
      let isAnswerCorrect = false;

      if (submitted) {
        if (question.questionType === 'SINGLE_CHOICE' || question.questionType === 'TIMED_REFLEX') {
          const matchedOption = question.options.find((opt) => opt.id === submitted.selectedOptionId);
          if (matchedOption && matchedOption.isCorrect) {
            isAnswerCorrect = true;
          }
        } else if (question.questionType === 'DRAG_DROP_ORDER') {
          // Kiểm tra thứ tự sắp xếp
          const correctOrderedOptionIds = question.options
            .filter((opt) => opt.isCorrect)
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((opt) => opt.id);

          const submittedOrder = submitted.orderedOptionIds || [];
          if (
            correctOrderedOptionIds.length > 0 &&
            correctOrderedOptionIds.length === submittedOrder.length &&
            correctOrderedOptionIds.every((id, idx) => id === submittedOrder[idx])
          ) {
            isAnswerCorrect = true;
          }
        }
      }

      if (isAnswerCorrect) {
        correctCount++;
      } else {
        // Ghi nhận lỗi sai
        const selectedOpt = question.options.find((o) => o.id === submitted?.selectedOptionId);
        const guidance = selectedOpt?.feedbackSpeech || question.explanation || 'Đội Trưởng Milo khuyên bé hãy quan sát kỹ trước khi quyết định!';

        mistakesToLog.push({
          questionId: question.id,
          selectedOptionId: submitted?.selectedOptionId,
          userInputOrder: submitted?.orderedOptionIds ? JSON.stringify(submitted.orderedOptionIds) : null as any,
          responseTimeMs: submitted?.responseTimeMs || 0,
          miloGuidance: guidance,
        });
      }
    }

    const wrongCount = totalQuestions - correctCount;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const isPassed = correctCount > 0 && score >= checkpoint.passScoreThreshold;

    // 3. Xây dựng phản hồi từ Đội Trưởng Milo
    let emotion: MiloEmotion = 'IDLE';
    let speech = '';
    let audioCue = 'sfx_milo_greeting';
    let badgeAwarded: string | null = null;
    let hazardLevel: HazardLevel = 'SAFE';

    const otherCheckpoints = await this.prisma.checkpoint.findMany({where:{lessonId:checkpoint.lessonId},include:{lesson:true,questions:{include:{options:true}}}});
    const versions = new Map(otherCheckpoints.map(c=>[c.id,this.fingerprint(c)]));
    const passedBefore = await this.prisma.testResult.findMany({where:{userId,isPassed:true,checkpointId:{in:otherCheckpoints.map(c=>c.id)}},select:{checkpointId:true,contentVersion:true}});
    const completedIds = new Set(passedBefore.filter(r=>r.contentVersion===versions.get(r.checkpointId)).map(r=>r.checkpointId));
    if (isPassed) completedIds.add(checkpointId);
    const lessonComplete = otherCheckpoints.every(c=>completedIds.has(c.id));
    const priorReward = await this.prisma.lessonReward.findUnique({where:{userId_lessonId:{userId,lessonId:checkpoint.lessonId}}});

    if (isPassed) {
      emotion = 'CHEERING';
      audioCue = 'sfx_milo_cheer';
      badgeAwarded = lessonComplete && !priorReward ? checkpoint.badgeShardReward || null : null;

      if (score === 100) {
        speech = 'Con đã trả lời đúng các câu trong bài này. Hãy cùng cha mẹ ôn lại điều vừa học nhé!';
      } else {
        speech = `Xuất sắc lắm nhà thám hiểm nhí! Bé đã vượt qua bài test an toàn với số điểm ${score}%. Tiếp tục phát huy nhé!`;
      }
    } else {
      emotion = 'THINKING';
      audioCue = 'sfx_milo_alert_sos';
      hazardLevel = 'CAUTION';
      speech = 'Mình cùng xem lại lời giải nhé. Con có thể học lại khi sẵn sàng.';
    }

    // 4. Lưu TestResult vào Database
    const testResult = await this.prisma.testResult.create({
      data: {
        id: submitDto.attemptId,
        userId,
        checkpointId,
        contentVersion: submitDto.contentVersion,
        contentSnapshot: JSON.stringify({id:checkpoint.id,title:checkpoint.title,lesson:{id:checkpoint.lesson.id,title:checkpoint.lesson.title,description:checkpoint.lesson.description,contentJson:checkpoint.lesson.contentJson},questions:checkpoint.questions,answers}),
        totalQuestions,
        correctCount,
        wrongCount,
        score,
        isPassed,
        timeTakenSeconds: totalTimeTakenSeconds,
        feedbackEmotion: emotion,
        feedbackSpeech: speech,
        badgeAwarded,
      },
    });

    // 5. Lưu MistakeLog nếu có câu sai
    if (mistakesToLog.length > 0) {
      await this.prisma.mistakeLog.createMany({
        data: mistakesToLog.map((m) => ({
          testResultId: testResult.id,
          userId,
          questionId: m.questionId,
          selectedOptionId: m.selectedOptionId || null,
          userInputOrder: m.userInputOrder || null,
          responseTimeMs: m.responseTimeMs,
          miloGuidance: m.miloGuidance,
        })),
      });
    }

    // 6. Cập nhật tiến độ bài học (UserLessonProgress) & Mảnh huy hiệu nếu vượt qua
    let starsEarned = 0;
    if (isPassed) {
      starsEarned = score === 100 ? 3 : score >= 90 ? 2 : 1;

      // Cập nhật UserLessonProgress
      await this.prisma.userLessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId,
            lessonId: checkpoint.lessonId,
          },
        },
        update: {
          status: lessonComplete ? 'COMPLETED' : 'IN_PROGRESS',
          score: Math.max(score, previousProgress?.score ?? 0),
          stars: Math.max(starsEarned, previousProgress?.stars ?? 0),
          isCompleted: lessonComplete,
          completedAt: lessonComplete ? new Date() : null,
        },
        create: {
          userId,
          lessonId: checkpoint.lessonId,
          status: lessonComplete ? 'COMPLETED' : 'IN_PROGRESS',
          score,
          stars: starsEarned,
          isCompleted: lessonComplete,
          completedAt: lessonComplete ? new Date() : null,
        },
      });

      // Cộng điểm an toàn (Safety Score XP) cho User
      if (lessonComplete && !priorReward) {
      const xpGained = checkpoint.lesson.rewardXp;
      await this.prisma.lessonReward.create({data:{userId,lessonId:checkpoint.lessonId,xp:xpGained}});
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          totalSafetyScore: { increment: xpGained },
        },
      });

      // Cập nhật Shard vào Badge của Vùng
      const zoneBadge = checkpoint.lesson.stage.zone.badges[0];
      if (zoneBadge) {
        const existingUserBadge = await this.prisma.userBadge.findUnique({
          where: {
            userId_badgeId: {
              userId,
              badgeId: zoneBadge.id,
            },
          },
        });

        const currentShards = (existingUserBadge?.collectedShards || 0) + 1;
        const isBadgeUnlocked = currentShards >= zoneBadge.requiredShardsCount;

        await this.prisma.userBadge.upsert({
          where: {
            userId_badgeId: {
              userId,
              badgeId: zoneBadge.id,
            },
          },
          update: {
            collectedShards: currentShards,
            isUnlocked: isBadgeUnlocked,
            unlockedAt: isBadgeUnlocked ? new Date() : existingUserBadge?.unlockedAt,
          },
          create: {
            userId,
            badgeId: zoneBadge.id,
            collectedShards: 1,
            isUnlocked: zoneBadge.requiredShardsCount <= 1,
            unlockedAt: zoneBadge.requiredShardsCount <= 1 ? new Date() : null,
          },
        });

        if (isBadgeUnlocked && (!existingUserBadge || !existingUserBadge.isUnlocked)) {
          await this.prisma.user.update({
            where: { id: userId },
            data: { totalBadges: { increment: 1 } },
          });
        }
      }
      }
    }

    const miloResponse: MiloAiResponse = {
      speech,
      emotion,
      hazardLevel,
      actionRequired: isPassed ? null : 'Xem lại hướng dẫn của Milo và làm lại bài test.',
      audioCue,
      badgeShard: badgeAwarded,
    };

    return {
      testResultId: testResult.id,
      score,
      isPassed,
      correctCount,
      wrongCount,
      totalQuestions,
      timeTakenSeconds: totalTimeTakenSeconds,
      starsEarned,
      miloResponse,
      review: checkpoint.questions.map(q=>{
        const answer = answerMap.get(q.id);
        const selected = answer?.orderedOptionIds || (answer?.selectedOptionId ? [answer.selectedOptionId] : []);
        return {questionId:q.id,prompt:q.promptText,selectedTexts:selected.map(id=>q.options.find(o=>o.id===id)?.optionText || 'Lựa chọn không còn hợp lệ'),
          correctTexts:q.options.filter(o=>o.isCorrect).sort((a,b)=>a.displayOrder-b.displayOrder).map(o=>o.optionText),
          isCorrect:!mistakesToLog.some(m=>m.questionId===q.id),explanation:q.explanation};
      }),
      mistakes: mistakesToLog.map((m) => ({
        questionId: m.questionId,
        guidance: m.miloGuidance,
      })),
    };
  }
}
