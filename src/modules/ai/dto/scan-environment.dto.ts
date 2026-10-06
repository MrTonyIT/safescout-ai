import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ScanEnvironmentDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Độ tuổi của bé phải là số nguyên' })
  @Min(5, { message: 'Độ tuổi tối thiểu là 5 tuổi' })
  @Max(12, { message: 'Độ tuổi tối đa là 12 tuổi' })
  childAge?: number = 7;

  @IsOptional()
  @IsString()
  currentZoneId?: string;

  @IsOptional()
  @IsString()
  currentLessonId?: string;

  @IsOptional()
  @IsString()
  userNickname?: string;
}
