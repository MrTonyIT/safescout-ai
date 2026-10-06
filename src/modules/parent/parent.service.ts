import { Injectable, UnauthorizedException, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  UpdateParentSettingsDto,
  DispatchEmergencyAlertDto,
  CreateChildProfileDto,
} from './dto/parent-gate.dto';

export interface EmergencyAlertItem {
  id: string;
  userId: string;
  childNickname: string;
  alertType: 'SOS_SIREN' | 'HAZARD_CRITICAL' | 'SPEED_DIAL' | 'MANUAL';
  latitude: number;
  longitude: number;
  googleMapsUrl: string;
  message: string;
  createdAt: string;
}

@Injectable()
export class ParentService {
  private readonly logger = new Logger(ParentService.name);

  // In-memory real-time Emergency SOS Alert Feed (FIFO queue, max 50)
  private emergencyAlerts: EmergencyAlertItem[] = [];

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Xác thực mã PIN của Cổng Phụ Huynh (Parent Gate)
   */
  async verifyPin(userId: string, pin: string): Promise<boolean> {
    const parentGate = await this.prisma.parentGate.findUnique({
      where: { userId },
    });

    if (!parentGate) {
      // Fallback for default user
      throw new NotFoundException(`Không tìm thấy cấu hình Cổng Phụ Huynh cho học viên: ${userId}`);
    }

    const isMatch = await bcrypt.compare(pin, parentGate.pinHash);
    if (!isMatch) {
      throw new UnauthorizedException('Mã PIN phụ huynh không chính xác.');
    }

    return true;
  }

  /**
   * Đổi mã PIN bảo vệ Cổng Phụ Huynh
   */
  async updatePin(userId: string, currentPin: string, newPin: string) {
    await this.verifyPin(userId, currentPin);

    const salt = await bcrypt.genSalt(10);
    const newPinHash = await bcrypt.hash(newPin, salt);

    await this.prisma.parentGate.update({
      where: { userId },
      data: { pinHash: newPinHash },
    });

    return { success: true, message: 'Đổi mã PIN phụ huynh thành công.' };
  }

  /**
   * Bắn cảnh báo khẩn cấp (Live SOS Beacon) từ thiết bị của bé
   */
  async dispatchEmergencyAlert(dto: DispatchEmergencyAlertDto) {
    throw new BadRequestException('Chức năng gửi cảnh báo từ xa chưa được mở.');
  }

  /**
   * Lấy danh sách định vị khẩn cấp cho phụ huynh
   */
  async getEmergencyAlerts(userId: string, pin: string) {
    await this.verifyPin(userId, pin);
    return this.emergencyAlerts.filter((a) => a.userId === userId);
  }

  /**
   * Lấy danh sách hồ sơ các bé trong gia đình (Multi-Child Profile)
   */
  async getChildrenProfiles(pin: string) {
    throw new UnauthorizedException('Chưa có phiên tài khoản gia đình hợp lệ.');
  }

  /**
   * Tạo hồ sơ bé mới trong gia đình
   */
  async createChildProfile(dto: CreateChildProfileDto) {
    await this.verifyPin('user_milo_explorer_01', dto.pin);

    const newUser = await this.prisma.user.create({
      data: {
        nickname: dto.nickname,
        age: dto.age,
        ageGroup: dto.age <= 6 ? 'EARLY_EXPLORER' : 'ADVANCED_SCOUT',
        explorerLevel: 1,
        totalSafetyScore: 0,
        totalBadges: 0,
      },
    });

    return {
      success: true,
      child: newUser,
      message: `Đã tạo thành công hồ sơ bé ${newUser.nickname}!`,
    };
  }

  /**
   * Lấy Báo cáo An toàn & Thống kê học tập dành cho Phụ Huynh (Parent Safety Dashboard)
   */
  async getChildSafetyReport(userId: string, pin: string) {
    await this.verifyPin(userId, pin);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        parentGate: true,
        lessonProgress: {
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
          },
        },
        testResults: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            checkpoint: true,
          },
        },
        mistakeLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            question: {
              include: {
                checkpoint: {
                  include: {
                    lesson: true,
                  },
                },
              },
            },
          },
        },
        userBadges: {
          include: {
            badge: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Không tìm thấy thông tin bé: ${userId}`);
    }

    // Phân tích vùng kỹ năng còn yếu dựa trên MistakeLog
    const hazardMistakeCounts: Record<string, number> = {};
    for (const log of user.mistakeLogs) {
      const hazard = log.question.hazardLevel || 'SAFE';
      hazardMistakeCounts[hazard] = (hazardMistakeCounts[hazard] || 0) + 1;
    }

    // Đề xuất hành động cho phụ huynh
    const recommendations: string[] = [];
    if (hazardMistakeCounts['CRITICAL_EMERGENCY'] && hazardMistakeCounts['CRITICAL_EMERGENCY'] > 0) {
      recommendations.push('Bé có một số phản xạ chưa chuẩn xác trong tình huống Khẩn Cấp (Lửa/Điện/Nước sâu). Ba mẹ nên cùng bé diễn tập thực tế tại nhà.');
    }
    if (user.testResults.some((t) => t.timeTakenSeconds > 45)) {
      recommendations.push('Thời gian phản xạ của bé có thể cải thiện thêm qua các bài tập đếm ngược 5 giây.');
    }
    if (recommendations.length === 0) {
      recommendations.push('Bé đang hoàn thành rất tốt các bài tập phản xạ an toàn! Hãy tiếp tục khích lệ bé!');
    }

    // Lấy 3 cảnh báo SOS gần nhất của bé
    const userAlerts = this.emergencyAlerts.filter((a) => a.userId === userId);

    return {
      childProfile: {
        id: user.id,
        nickname: user.nickname,
        age: user.age,
        ageGroup: user.ageGroup,
        explorerLevel: user.explorerLevel,
        totalSafetyScore: user.totalSafetyScore,
        totalBadges: user.totalBadges,
      },
      parentSettings: {
        dailyTimeLimitMinutes: user.parentGate?.dailyTimeLimitMinutes || 30,
        emergencyContactEnabled: user.parentGate?.emergencyContactEnabled ?? true,
        weeklyReportEnabled: user.parentGate?.weeklyReportEnabled ?? true,
        parentEmail: user.parentGate?.parentEmail || null,
        parentPhone: user.parentGate?.parentPhone || null,
      },
      recentTestResults: user.testResults.map((tr) => ({
        id: tr.id,
        checkpointTitle: tr.checkpoint.title,
        score: tr.score,
        isPassed: tr.isPassed,
        timeTakenSeconds: tr.timeTakenSeconds,
        feedbackSpeech: tr.feedbackSpeech,
        createdAt: tr.createdAt,
      })),
      recentMistakes: user.mistakeLogs.map((m) => ({
        id: m.id,
        questionText: m.question.promptText,
        hazardLevel: m.question.hazardLevel,
        responseTimeMs: m.responseTimeMs,
        miloGuidance: m.miloGuidance,
        lessonTitle: m.question.checkpoint.lesson.title,
        createdAt: m.createdAt,
      })),
      unlockedBadges: user.userBadges
        .filter((ub) => ub.isUnlocked)
        .map((ub) => ({
          name: ub.badge.name,
          code: ub.badge.code,
          iconUrl: ub.badge.iconUrl,
          unlockedAt: ub.unlockedAt,
        })),
      emergencyAlerts: userAlerts,
      analytics: {
        hazardMistakeCounts,
        recommendations,
      },
    };
  }

  /**
   * Cập nhật cài đặt phụ huynh
   */
  async updateSettings(dto: UpdateParentSettingsDto) {
    await this.verifyPin(dto.userId, dto.pin);

    const updateData: any = {};
    if (dto.dailyTimeLimitMinutes !== undefined) updateData.dailyTimeLimitMinutes = dto.dailyTimeLimitMinutes;
    if (dto.emergencyContactEnabled !== undefined) updateData.emergencyContactEnabled = dto.emergencyContactEnabled;
    if (dto.weeklyReportEnabled !== undefined) updateData.weeklyReportEnabled = dto.weeklyReportEnabled;
    if (dto.parentEmail !== undefined) updateData.parentEmail = dto.parentEmail;
    if (dto.parentPhone !== undefined) updateData.parentPhone = dto.parentPhone;

    const updated = await this.prisma.parentGate.update({
      where: { userId: dto.userId },
      data: updateData,
    });

    return {
      success: true,
      message: 'Cập nhật cài đặt phụ huynh thành công.',
      settings: {
        dailyTimeLimitMinutes: updated.dailyTimeLimitMinutes,
        emergencyContactEnabled: updated.emergencyContactEnabled,
        weeklyReportEnabled: updated.weeklyReportEnabled,
        parentEmail: updated.parentEmail,
        parentPhone: updated.parentPhone,
      },
    };
  }
}
