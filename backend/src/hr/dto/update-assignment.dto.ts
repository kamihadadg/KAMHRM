import { IsString, IsDateString, IsNumber, IsBoolean, IsOptional, IsUUID, Min, Max } from 'class-validator';

export class UpdateAssignmentDto {
    @IsOptional()
    @IsString()
    contractId?: string;

    @IsOptional()
    @IsString()
    positionId?: string;

    @IsOptional()
    @IsDateString()
    startDate?: Date;

    @IsOptional()
    @IsDateString()
    endDate?: Date;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    workloadPercentage?: number;

    @IsOptional()
    @IsBoolean()
    isPrimary?: boolean;

    @IsOptional()
    @IsString()
    customJobDescription?: string;
}
