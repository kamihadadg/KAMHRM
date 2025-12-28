import { IsEnum, IsNotEmpty, IsOptional, IsDateString, IsString } from 'class-validator';
import { ContractType } from '../entities/contract.entity';

export class CreateContractDto {
    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsDateString()
    startDate: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsNotEmpty()
    @IsEnum(ContractType)
    contractType: ContractType;

    @IsOptional()
    @IsString()
    fileUrl?: string;
}
