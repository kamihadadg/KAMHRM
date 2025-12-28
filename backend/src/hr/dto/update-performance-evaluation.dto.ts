import {
    IsOptional,
    IsString,
    IsEnum,
    IsDateString,
    IsArray,
    ValidateNested,
    IsNumber,
    Min,
    Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EvaluationType, EvaluationStatus } from '../entities/performance-evaluation.entity';
import { EvaluationCategoryDto } from './create-performance-evaluation.dto';

export class UpdatePerformanceEvaluationDto {
    @IsOptional()
    @IsString()
    period?: string;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EvaluationCategoryDto)
    categories?: EvaluationCategoryDto[];

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

    @IsOptional()
    @IsString()
    managerComments?: string;
}
