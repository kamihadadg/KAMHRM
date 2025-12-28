import {
    IsNotEmpty,
    IsString,
    IsDateString,
    IsArray,
    IsEnum,
    IsOptional,
    IsUUID,
} from 'class-validator';
import { EvaluationType } from '../entities/performance-evaluation.entity';

export class CreateEvaluationCycleDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsUUID()
    templateId: string;

    @IsNotEmpty()
    @IsDateString()
    startDate: string;

    @IsNotEmpty()
    @IsDateString()
    endDate: string;

    @IsOptional()
    @IsDateString()
    submissionDeadline?: string;

    @IsNotEmpty()
    @IsArray()
    @IsEnum(EvaluationType, { each: true })
    evaluationTypes: EvaluationType[];
}

