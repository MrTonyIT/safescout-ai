import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LearningService } from './learning.service';
import { SubmitCheckpointTestDto } from './dto/submit-test.dto';
import { createSuccessResponse, ApiResponse } from '../../common/interfaces/api-response.interface';

@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  /**
   * Lấy bản đồ hành trình 10 Vùng Đất Sinh Tồn và tiến độ của học viên
   */
  @Get('journey-map')
  async getJourneyMap(@Query('userId') userId: string): Promise<ApiResponse<any>> {
    if (!userId) {
      throw new BadRequestException('Vui lòng cung cấp userId trong query parameters.');
    }
    const mapData = await this.learningService.getJourneyMap(userId);
    return createSuccessResponse(mapData, 'Lấy dữ liệu Journey Map thành công');
  }

  /**
   * Lấy chi tiết câu hỏi phản xạ của một Checkpoint
   */
  @Get('checkpoints/:id')
  async getCheckpointDetails(
    @Param('id') checkpointId: string,
    @Query('userId') userId?: string,
  ): Promise<ApiResponse<any>> {
    const details = await this.learningService.getCheckpointDetails(checkpointId, userId);
    return createSuccessResponse(details, 'Lấy chi tiết Checkpoint thành công');
  }

  /**
   * Nộp kết quả bài kiểm tra phản xạ đếm ngược
   */
  @Post('checkpoints/:id/submit')
  @HttpCode(HttpStatus.OK)
  async submitCheckpointTest(
    @Param('id') checkpointId: string,
    @Body() submitDto: SubmitCheckpointTestDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.learningService.submitCheckpointTest(
      submitDto.userId,
      checkpointId,
      submitDto,
    );
    return createSuccessResponse(result, 'Chấm điểm bài test phản xạ hoàn tất');
  }
}
