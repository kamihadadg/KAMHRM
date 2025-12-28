import { IsString, IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ContractType } from '../entities/contract.entity';

export class UpdateContractDto {
    @IsOptional()
    @IsDateString()
    startDate?: Date;

    @IsOptional()
    @IsDateString()
    endDate?: Date;

    @IsOptional()
    @IsEnum(ContractType)
    contractType?: ContractType;

    @IsOptional()
    @IsString()
    fileUrl?: string;
}
