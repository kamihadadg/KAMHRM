import {
    IsOptional,
    IsString,
    IsDateString,
    IsEnum,
    IsNumber,
    IsBoolean,
    IsArray,
    ValidateNested,
    IsPhoneNumber,
    Min,
    Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EducationDto, PreviousJobDto, EmergencyContactDto } from './create-employee-profile.dto';

export class UpdateEmployeeProfileDto {
    // Personal Information
    @IsOptional()
    @IsString()
    nationalId?: string;

    @IsOptional()
    @IsDateString()
    birthDate?: string;

    @IsOptional()
    @IsString()
    birthPlace?: string;

    @IsOptional()
    @IsEnum(['MALE', 'FEMALE'])
    gender?: 'MALE' | 'FEMALE';

    @IsOptional()
    @IsEnum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'])
    maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';

    @IsOptional()
    @IsNumber()
    @Min(0)
    childrenCount?: number;

    @IsOptional()
    @IsEnum(['COMPLETED', 'EXEMPTED', 'NOT_COMPLETED'])
    militaryStatus?: 'COMPLETED' | 'EXEMPTED' | 'NOT_COMPLETED';

    // Contact Information
    @IsOptional()
    @IsPhoneNumber('IR')
    phoneNumber?: string;

    @IsOptional()
    @IsPhoneNumber('IR')
    emergencyPhone?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    email?: string;

    // Employment Information
    @IsOptional()
    @IsDateString()
    hireDate?: string;

    @IsOptional()
    @IsString()
    employeeId?: string;

    @IsOptional()
    @IsString()
    department?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    baseSalary?: number;

    @IsOptional()
    @IsEnum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'])
    employmentType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';

    // Insurance and Tax Information
    @IsOptional()
    @IsString()
    insuranceNumber?: string;

    @IsOptional()
    @IsString()
    taxCode?: string;

    @IsOptional()
    @IsString()
    bankAccountNumber?: string;

    @IsOptional()
    @IsString()
    bankName?: string;

    // Education (as JSON string)
    @IsOptional()
    @IsString()
    education?: string;

    // Previous Jobs (as JSON string)
    @IsOptional()
    @IsString()
    previousJobs?: string;

    // Emergency Contacts (as JSON string)
    @IsOptional()
    @IsString()
    emergencyContacts?: string;

    // Additional Information
    @IsOptional()
    @IsString()
    skills?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    // Profile Image
    @IsOptional()
    @IsString()
    profileImageUrl?: string;

    // Status
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
