import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import {
  CAPTAIN_MILO_SYSTEM_PROMPT,
  MILO_VISION_ANALYSIS_INSTRUCTION,
  generateMiloFallbackResponse,
} from './prompts/captain-milo.prompt';
import {
  MiloAiResponse,
  EnvironmentScanContext,
  HazardLevel,
  MiloEmotion,
} from './interfaces/milo-response.interface';
import { ChatWithMiloDto } from './dto/chat-milo.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private aiClient: GoogleGenAI | null = null;
  private readonly modelName: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.modelName = process.env.GEMINI_MODEL || 'gemini-3.7-flash';

    if (apiKey && apiKey.trim().length > 0) {
      try {
        this.aiClient = new GoogleGenAI({ apiKey });
        this.logger.log(`Google GenAI SDK đã khởi tạo thành công với model: ${this.modelName}`);
      } catch (error) {
        this.logger.warn(`Không thể khởi tạo GoogleGenAI SDK: ${(error as Error).message}. Sẽ kích hoạt Fallback Engine.`);
      }
    } else {
      this.logger.warn('GEMINI_API_KEY chưa được cấu hình. Hệ thống AI đang chạy ở chế độ Safe Fallback Engine.');
    }
  }

  /**
   * Quét và phân tích môi trường thực tế qua Single-frame ảnh (tối đa 4MB)
   */
  async scanEnvironment(
    imageBuffer: Buffer,
    mimeType: string,
    context?: EnvironmentScanContext,
  ): Promise<MiloAiResponse> {
    // 1. Kiểm tra kích thước và định dạng ảnh
    const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new BadRequestException('Ảnh chụp môi trường không được để trống.');
    }

    if (imageBuffer.length > MAX_FILE_SIZE) {
      throw new BadRequestException('Kích thước ảnh vượt quá giới hạn 4MB.');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg'];
    if (!allowedMimeTypes.includes(mimeType.toLowerCase())) {
      throw new BadRequestException(`Định dạng ảnh không hợp lệ (${mimeType}). Hỗ trợ JPEG, PNG, WEBP.`);
    }

    // 2. Nếu không có AI Client, trả về Fallback an toàn
    if (!this.aiClient) {
      this.logger.log('Fallback Mode: Trả về kết quả phân tích ngoại tuyến từ Captain Milo.');
      return generateMiloFallbackResponse('NETWORK_ERROR', 'Quét môi trường ngoại tuyến');
    }

    try {
      // 3. Chuẩn bị nội dung gửi tới Gemini Multimodal API
      const base64Data = imageBuffer.toString('base64');
      const ageContext = context?.childAge ? `Bé đang ở độ tuổi: ${context.childAge} tuổi.` : 'Bé ở độ tuổi 7 tuổi.';
      const zoneContext = context?.currentZone ? `Vùng thám hiểm hiện tại: ${context.currentZone}.` : '';

      const promptText = `
${MILO_VISION_ANALYSIS_INSTRUCTION}

[NGỮ CẢNH HỌC VIÊN]
${ageContext}
${zoneContext}
Hãy quan sát kỹ ảnh chụp môi trường thực tế này, phát hiện các vật thể an toàn hoặc nguy cơ, và phản hồi 100% JSON theo đúng schema của Đội Trưởng Milo.
`;

      const response = await this.aiClient.models.generateContent({
        model: this.modelName,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType,
                },
              },
              {
                text: `${CAPTAIN_MILO_SYSTEM_PROMPT}\n\n${promptText}`,
              },
            ],
          },
        ],
      });

      const responseText = response.text || '';
      return this.parseAndValidateMiloResponse(responseText, 'Quét môi trường');
    } catch (error) {
      this.logger.error(`Lỗi khi gọi Gemini Vision API: ${(error as Error).message}`, (error as Error).stack);
      return generateMiloFallbackResponse('TIMEOUT', 'Lỗi phân tích hình ảnh');
    }
  }

  /**
   * Đàm thoại tương tác với Đội Trưởng Milo (Chat with Captain Milo)
   */
  async chatWithMilo(dto: ChatWithMiloDto): Promise<MiloAiResponse> {
    const { message, childAge = 7, history = [], userNickname = 'Nhà thám hiểm nhí' } = dto;

    // 1. Kiểm tra lọc sơ bộ PII (Quy tắc COPPA/GDPR-K)
    const sanitizedMessage = this.sanitizeInputForCOPPA(message);

    // 2. Nếu không có kết nối AI, sử dụng Fallback Engine
    if (!this.aiClient) {
      return generateMiloFallbackResponse('NETWORK_ERROR', sanitizedMessage);
    }

    try {
      // Xây dựng lịch sử đàm thoại
      const contentsPayload: any[] = [
        {
          role: 'user',
          parts: [{ text: `${CAPTAIN_MILO_SYSTEM_PROMPT}\n\nHọc viên nhí: ${userNickname}, ${childAge} tuổi.` }],
        },
        {
          role: 'model',
          parts: [
            {
              text: JSON.stringify({
                speech: `Chào ${userNickname}! Đội Trưởng Milo đã sẵn sàng cùng bé khám phá và học các kỹ năng an toàn siêu đẳng rồi đây!`,
                emotion: 'IDLE',
                hazardLevel: 'SAFE',
                actionRequired: null,
                audioCue: 'sfx_milo_greeting',
                badgeShard: null,
              }),
            },
          ],
        },
      ];

      // Thêm tối đa 4 lượt chat gần nhất để tối ưu ngữ cảnh
      const recentHistory = history.slice(-4);
      for (const item of recentHistory) {
        contentsPayload.push({
          role: item.role === 'model' ? 'model' : 'user',
          parts: [{ text: item.content }],
        });
      }

      // Thêm câu hỏi mới nhất của bé
      contentsPayload.push({
        role: 'user',
        parts: [{ text: sanitizedMessage }],
      });

      const response = await this.aiClient.models.generateContent({
        model: this.modelName,
        contents: contentsPayload,
      });

      const responseText = response.text || '';
      return this.parseAndValidateMiloResponse(responseText, sanitizedMessage);
    } catch (error) {
      this.logger.error(`Lỗi khi chat với Milo qua Gemini API: ${(error as Error).message}`);
      return generateMiloFallbackResponse('INVALID_RESPONSE', sanitizedMessage);
    }
  }

  /**
   * Bộ lọc sơ bộ thông tin cá nhân (COPPA/GDPR-K Pre-filter)
   */
  private sanitizeInputForCOPPA(input: string): string {
    if (!input) return '';
    // Lọc số điện thoại Việt Nam / quốc tế nếu bé gõ vào
    const phonePattern = /(0|\+84)[3|5|7|8|9][0-9]{8}/g;
    // Lọc email
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

    let clean = input.replace(phonePattern, '[SỐ ĐIỆN THOẠI ĐÃ ẨN]');
    clean = clean.replace(emailPattern, '[EMAIL ĐÃ ẨN]');
    return clean;
  }

  /**
   * Parse và kiểm định cấu trúc JSON đầu ra từ Gemini để bảo đảm 100% đúng schema
   */
  private parseAndValidateMiloResponse(rawText: string, fallbackContext: string): MiloAiResponse {
    try {
      // Làm sạch chuỗi JSON nếu model trả về markdown fences ```json ... ```
      let jsonString = rawText.trim();
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Tìm vị trí JSON object hợp lệ
      const firstBrace = jsonString.indexOf('{');
      const lastBrace = jsonString.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonString = jsonString.substring(firstBrace, lastBrace + 1);
      }

      const parsed = JSON.parse(jsonString);

      // Validate và chuẩn hóa các trường
      const validEmotions: MiloEmotion[] = ['IDLE', 'THINKING', 'CHEERING', 'DANGER_ALERT'];
      const validHazards: HazardLevel[] = ['SAFE', 'CAUTION', 'CRITICAL_EMERGENCY'];

      const emotion: MiloEmotion = validEmotions.includes(parsed.emotion) ? parsed.emotion : 'IDLE';
      const hazardLevel: HazardLevel = validHazards.includes(parsed.hazardLevel) ? parsed.hazardLevel : 'UNKNOWN';

      const audioCue =
        parsed.audioCue ||
        (emotion === 'DANGER_ALERT'
          ? 'sfx_milo_alert_sos'
          : emotion === 'CHEERING'
            ? 'sfx_milo_cheer'
            : emotion === 'THINKING'
              ? 'sfx_milo_scanning'
              : 'sfx_milo_greeting');

      return {
        speech: typeof parsed.speech === 'string' && parsed.speech.length > 0
          ? parsed.speech
          : 'Đội Trưởng Milo luôn ở đây cùng bé! Hãy nhớ luôn quan sát an toàn xung quanh nhé!',
        emotion,
        hazardLevel,
        actionRequired: parsed.actionRequired || null,
        audioCue,
        badgeShard: parsed.badgeShard || null,
      };
    } catch (error) {
      this.logger.warn(`Không thể parse JSON từ AI output: ${rawText.substring(0, 100)}... Kích hoạt Fallback.`);
      return generateMiloFallbackResponse('INVALID_RESPONSE', fallbackContext);
    }
  }
}
