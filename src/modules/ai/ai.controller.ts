import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';
import { ScanEnvironmentDto } from './dto/scan-environment.dto';
import { ChatWithMiloDto } from './dto/chat-milo.dto';
import { MiloAiResponse } from './interfaces/milo-response.interface';
import { createSuccessResponse, ApiResponse } from '../../common/interfaces/api-response.interface';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * Quét và phân tích hình ảnh môi trường thực tế (Single-frame, max 4MB)
   */
  @Post('scan-environment')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 4 * 1024 * 1024, // 4MB
      },
    }),
  )
  async scanEnvironment(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: ScanEnvironmentDto,
  ): Promise<ApiResponse<MiloAiResponse>> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Vui lòng tải lên file ảnh môi trường (field: image, dung lượng tối đa 4MB).');
    }

    const scanResult = await this.aiService.scanEnvironment(file.buffer, file.mimetype, {
      childAge: body.childAge,
      currentZone: body.currentZoneId,
      currentLesson: body.currentLessonId,
      userNickname: body.userNickname,
    });

    return createSuccessResponse(scanResult, 'Đội Trưởng Milo đã hoàn thành quét môi trường!');
  }

  /**
   * Trò chuyện đàm thoại trực tiếp với Đội Trưởng Milo
   */
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chatWithMilo(@Body() chatDto: ChatWithMiloDto): Promise<ApiResponse<MiloAiResponse>> {
    const response = await this.aiService.chatWithMilo(chatDto);
    return createSuccessResponse(response, 'Phản hồi từ Đội Trưởng Milo');
  }

  /**
   * Health Check & Model info
   */
  @Get('health')
  getHealth(): ApiResponse<{ status: string; engine: string; version: string }> {
    return createSuccessResponse(
      {
        status: 'DISABLED',
        engine: 'AI is not enabled for this internal preview',
        version: '1.0.0',
      },
      'AI chưa được mở để sử dụng.',
    );
  }
}
