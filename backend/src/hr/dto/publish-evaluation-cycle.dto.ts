import {
    IsOptional,
    IsArray,
    IsUUID,
} from 'class-validator';

export class PublishEvaluationCycleDto {
    @IsOptional()
    @IsArray()
    @IsUUID(undefined, { each: true })
    targetEmployeeIds?: string[]; // اختیاری - برای فیلتر پرسنل
}

