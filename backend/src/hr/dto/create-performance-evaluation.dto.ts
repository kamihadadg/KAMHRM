import {
    IsNotEmpty,
    IsString,
    IsEnum,
    IsDateString,
    IsArray,
    ValidateNested,
    IsOptional,
    IsNumber,
    Min,
    Max,
    IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EvaluationType, EvaluationStatus } from '../entities/performance-evaluation.entity';

export class EvaluationCriterionDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(5)
    rating?: number;

    @IsOptional()
    @IsString()
    comments?: string;
}

export class EvaluationCategoryDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(10)
    weight?: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EvaluationCriterionDto)
    criteria: EvaluationCriterionDto[];
}

export class CreatePerformanceEvaluationDto {
    @IsNotEmpty()
    @IsUUID()
    employeeId: string; // ارزیابی‌شونده

    @IsNotEmpty()
    @IsUUID()
    evaluatorId: string; // ارزیاب

    @IsOptional()
    @IsEnum(EvaluationType)
    evaluationType?: EvaluationType;

    @IsNotEmpty()
    @IsString()
    period: string; // دوره ارزیابی

    @IsNotEmpty()
    @IsDateString()
    startDate: string;

    @IsNotEmpty()
    @IsDateString()
    endDate: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EvaluationCategoryDto)
    categories: EvaluationCategoryDto[];

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(5)
    overallRating?: number;

    @IsOptional()
    @IsString()
    overallComments?: string;

    @IsOptional()
    @IsString()
    strengths?: string;

    @IsOptional()
    @IsString()
    weaknesses?: string;

    @IsOptional()
    @IsString()
    improvementGoals?: string;

    @IsOptional()
    @IsEnum(EvaluationStatus)
    status?: EvaluationStatus;
}
