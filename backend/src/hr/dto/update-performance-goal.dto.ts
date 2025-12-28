import {
    IsOptional,
    IsString,
    IsEnum,
    IsDateString,
    IsNumber,
    Min,
    Max,
} from 'class-validator';
import { GoalCategory, GoalPriority, GoalStatus } from '../entities/performance-goal.entity';

export class UpdatePerformanceGoalDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(GoalCategory)
    category?: GoalCategory;

    @IsOptional()
    @IsEnum(GoalPriority)
    priority?: GoalPriority;

    @IsOptional()
    @IsString()
    measurementCriteria?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    targetValue?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    currentValue?: number;

    @IsOptional()
    @IsString()
    unit?: string;

    @IsOptional()
    @IsDateString()
    deadline?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    progress?: number;

    @IsOptional()
    @IsEnum(GoalStatus)
    status?: GoalStatus;

    @IsOptional()
    @IsString()
    comments?: string;
}
