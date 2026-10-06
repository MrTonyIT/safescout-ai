import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ChatMessageDto {
  @IsNotEmpty()
  @IsString()
  role: 'user' | 'model' | 'system';

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  content: string;
}

export class ChatWithMiloDto {
  @IsNotEmpty({ message: 'Lời nhắn gửi tới Đội Trưởng Milo không được để trống' })
  @IsString()
  @MaxLength(500, { message: 'Lời nhắn tối đa 500 ký tự' })
  message: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Độ tuổi của bé phải là số nguyên' })
  @Min(5, { message: 'Độ tuổi tối thiểu là 5 tuổi' })
  @Max(12, { message: 'Độ tuổi tối đa là 12 tuổi' })
  childAge?: number = 7;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  history?: ChatMessageDto[];

  @IsOptional()
  @IsString()
  userNickname?: string;
}
