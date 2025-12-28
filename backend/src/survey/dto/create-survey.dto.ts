import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType } from '../entities/question.entity';

class CreateQuestionDto {
  @IsString()
  question: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsOptional()
  @IsString()
  options?: string; // JSON string

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  order?: number;
}

export class CreateSurveyDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  endDate?: string;
}
