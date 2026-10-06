import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min, Max, ArrayMaxSize, ValidateNested, Matches, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerItemDto {
  @IsNotEmpty({ message: 'questionId không được để trống' })
  @IsString()
  @MaxLength(100)
  questionId: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  selectedOptionId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, {each:true})
  @ArrayMaxSize(100)
  orderedOptionIds?: string[];

  @IsNotEmpty({ message: 'Thời gian phản xạ responseTimeMs không được để trống' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(86400000)
  responseTimeMs: number; // Thời gian phản xạ tính bằng milliseconds
}

export class SubmitCheckpointTestDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-f0-9]{64}$/)
  contentVersion: string;
  @IsUUID('4')
  attemptId: string;
  @IsNotEmpty({ message: 'userId không được để trống' })
  @IsString()
  @MaxLength(100)
  userId: string;

  @IsNotEmpty({ message: 'Danh sách câu trả lời answers không được để trống' })
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => AnswerItemDto)
  answers: AnswerItemDto[];

  @IsNotEmpty({ message: 'Tổng thời gian làm bài không được để trống' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(86400)
  totalTimeTakenSeconds: number;
}
