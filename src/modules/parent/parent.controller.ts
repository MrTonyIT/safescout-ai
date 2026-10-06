import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ParentService } from './parent.service';
import {
  VerifyPinDto,
  UpdatePinDto,
  UpdateParentSettingsDto,
  DispatchEmergencyAlertDto,
  CreateChildProfileDto,
} from './dto/parent-gate.dto';
import { createSuccessResponse, ApiResponse } from '../../common/interfaces/api-response.interface';

@Controller('parent')
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  /**
   * Xác thực mã PIN để vào khu vực Phụ Huynh
   */
  @Post('verify-pin')
  @HttpCode(HttpStatus.OK)
  async verifyPin(@Body() dto: VerifyPinDto): Promise<ApiResponse<{ verified: boolean }>> {
    const verified = await this.parentService.verifyPin(dto.userId, dto.pin);
    return createSuccessResponse({ verified }, 'Xác thực mã PIN thành công');
  }

  /**
   * Đổi mã PIN phụ huynh
   */
  @Post('update-pin')
  @HttpCode(HttpStatus.OK)
  async updatePin(@Body() dto: UpdatePinDto): Promise<ApiResponse<any>> {
    const result = await this.parentService.updatePin(dto.userId, dto.currentPin, dto.newPin);
    return createSuccessResponse(result, 'Đổi mã PIN thành công');
  }

  /**
   * Bắn cảnh báo khẩn cấp (SOS Live Beacon) kèm định vị GPS
   */
  @Post('emergency-alert')
  @HttpCode(HttpStatus.OK)
  async dispatchEmergencyAlert(@Body() dto: DispatchEmergencyAlertDto): Promise<ApiResponse<any>> {
    const result = await this.parentService.dispatchEmergencyAlert(dto);
    return createSuccessResponse(result, 'Đã phát cảnh báo khẩn cấp');
  }

  /**
   * Lấy danh sách cảnh báo khẩn cấp của bé
   */
  @Get('emergency-alerts')
  async getEmergencyAlerts(
    @Query('userId') userId: string,
    @Query('pin') pin: string,
  ): Promise<ApiResponse<any>> {
    if (!userId || !pin) {
      throw new BadRequestException('Vui lòng cung cấp userId và pin.');
    }
    const alerts = await this.parentService.getEmergencyAlerts(userId, pin);
    return createSuccessResponse(alerts, 'Lấy danh sách cảnh báo SOS thành công');
  }

  /**
   * Lấy danh sách tất cả các bé trong gia đình (Multi-Child)
   */
  @Get('children')
  async getChildrenProfiles(@Query('pin') pin: string): Promise<ApiResponse<any>> {
    if (!pin) {
      throw new BadRequestException('Vui lòng cung cấp pin.');
    }
    const children = await this.parentService.getChildrenProfiles(pin);
    return createSuccessResponse(children, 'Lấy danh sách hồ sơ bé thành công');
  }

  /**
   * Tạo hồ sơ bé mới trong gia đình
   */
  @Post('create-child')
  @HttpCode(HttpStatus.OK)
  async createChildProfile(@Body() dto: CreateChildProfileDto): Promise<ApiResponse<any>> {
    const result = await this.parentService.createChildProfile(dto);
    return createSuccessResponse(result, 'Tạo hồ sơ bé thành công');
  }

  /**
   * Lấy Báo cáo An toàn & Phân tích lỗi sai của bé dành cho Phụ huynh
   */
  @Get('safety-report')
  async getChildSafetyReport(
    @Query('userId') userId: string,
    @Query('pin') pin: string,
  ): Promise<ApiResponse<any>> {
    if (!userId || !pin) {
      throw new BadRequestException('Vui lòng cung cấp đầy đủ userId và pin.');
    }
    const report = await this.parentService.getChildSafetyReport(userId, pin);
    return createSuccessResponse(report, 'Lấy báo cáo an toàn thành công');
  }

  /**
   * Cập nhật cấu hình bảo vệ trẻ em (Giới hạn thời gian học, thông báo khẩn)
   */
  @Post('settings')
  @HttpCode(HttpStatus.OK)
  async updateSettings(@Body() dto: UpdateParentSettingsDto): Promise<ApiResponse<any>> {
    const result = await this.parentService.updateSettings(dto);
    return createSuccessResponse(result, 'Cập nhật cài đặt phụ huynh thành công');
  }
}
