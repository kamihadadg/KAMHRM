import { IsNotEmpty, IsOptional, IsDateString, IsNumber, Min, Max, IsBoolean, IsString } from 'class-validator';

export class CreateAssignmentDto {
    @IsNotEmpty()
    @IsString()
    contractId: string;

    @IsNotEmpty()
    @IsString()
    positionId: string;

    @IsNotEmpty()
    @IsDateString()
    startDate: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Max(100)
    workloadPercentage: number;

    @IsOptional()
    @IsBoolean()
    isPrimary?: boolean;

    @IsOptional()
    @IsString()
    customJobDescription?: string;
}
