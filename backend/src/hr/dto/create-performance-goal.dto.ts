import {
    IsNotEmpty,
    IsString,
    IsEnum,
    IsDateString,
    IsOptional,
    IsNumber,
    Min,
    Max,
    IsUUID,
} from 'class-validator';
import { GoalCategory, GoalPriority, GoalStatus } from '../entities/performance-goal.entity';

export class CreatePerformanceGoalDto {
    @IsNotEmpty()
    @IsUUID()
    employeeId: string; // مالک هدف

    @IsOptional()
    @IsUUID()
    setterId?: string; // تنظیم‌کننده هدف (معمولاً مدیر)

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

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

    @IsNotEmpty()
    @IsDateString()
    deadline: string;

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

    @IsOptional()
    @IsUUID()
    parentGoalId?: string;
}
