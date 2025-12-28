import {
    IsNotEmpty,
    IsString,
    IsArray,
    ValidateNested,
    IsOptional,
    IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EvaluationCategoryDto } from './create-performance-evaluation.dto';

export class CreateEvaluationTemplateDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EvaluationCategoryDto)
    categories: EvaluationCategoryDto[];

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

