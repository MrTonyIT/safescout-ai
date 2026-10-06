import { IsBoolean, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Length, Max, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class VerifyPinDto {
  @IsNotEmpty({ message: 'userId không được để trống' })
  @IsString()
  userId: string;

  @IsNotEmpty({ message: 'Mã PIN không được để trống' })
  @IsString()
  @Length(4, 6, { message: 'Mã PIN phải từ 4 đến 6 chữ số' })
  pin: string;
}

export class UpdatePinDto {
  @IsNotEmpty({ message: 'userId không được để trống' })
  @IsString()
  userId: string;

  @IsNotEmpty({ message: 'Mã PIN hiện tại không được để trống' })
  @IsString()
  currentPin: string;

  @IsNotEmpty({ message: 'Mã PIN mới không được để trống' })
  @IsString()
  @Length(4, 6, { message: 'Mã PIN mới phải từ 4 đến 6 chữ số' })
  newPin: string;
}

export class UpdateParentSettingsDto {
  @IsNotEmpty({ message: 'userId không được để trống' })
  @IsString()
  userId: string;

  @IsNotEmpty({ message: 'Mã PIN xác thực không được để trống' })
  @IsString()
  pin: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'Giới hạn thời gian không âm' })
  @Max(180, { message: 'Giới hạn thời gian tối đa 180 phút' })
  dailyTimeLimitMinutes?: number;

  @IsOptional()
  @IsBoolean()
  emergencyContactEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  weeklyReportEnabled?: boolean;

  @IsOptional()
  @IsEmail({}, { message: 'Email phụ huynh không đúng định dạng' })
  parentEmail?: string;

  @IsOptional()
  @IsString()
  parentPhone?: string;
}

export class DispatchEmergencyAlertDto {
  @IsNotEmpty({ message: 'userId không được để trống' })
  @IsString()
  userId: string;

  @IsNotEmpty({ message: 'Loại cảnh báo không được để trống' })
  @IsString()
  alertType: 'SOS_SIREN' | 'HAZARD_CRITICAL' | 'SPEED_DIAL' | 'MANUAL';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  message?: string;
}

export class CreateChildProfileDto {
  @IsNotEmpty({ message: 'Mã PIN phụ huynh không được để trống' })
  @IsString()
  pin: string;

  @IsNotEmpty({ message: 'Tên hiển thị của bé không được để trống' })
  @IsString()
  nickname: string;

  @Type(() => Number)
  @IsInt()
  @Min(3)
  @Max(14)
  age: number;
}
