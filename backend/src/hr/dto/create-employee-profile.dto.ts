import {
    IsNotEmpty,
    IsString,
    IsDateString,
    IsEnum,
    IsOptional,
    IsNumber,
    IsBoolean,
    IsArray,
    ValidateNested,
    IsPhoneNumber,
    Min,
    Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
    @IsOptional()
    @IsString()
    province?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    street?: string;

    @IsOptional()
    @IsString()
    postalCode?: string;

    @IsOptional()
    @IsString()
    fullAddress?: string;
}

export class EmergencyContactDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    relationship: string;

    @IsNotEmpty()
    @IsPhoneNumber('IR')
    phone: string;
}

export class EducationDto {
    @IsNotEmpty()
    @IsEnum(['HIGH_SCHOOL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'PHD'])
    level: 'HIGH_SCHOOL' | 'ASSOCIATE' | 'BACHELOR' | 'MASTER' | 'PHD';

    @IsOptional()
    @IsString()
    field?: string;

    @IsOptional()
    @IsString()
    university?: string;

    @IsOptional()
    @IsNumber()
    @Min(1950)
    @Max(2030)
    graduationYear?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(20)
    gpa?: number;
}

export class PreviousJobDto {
    @IsNotEmpty()
    @IsString()
    companyName: string;

    @IsNotEmpty()
    @IsString()
    position: string;

    @IsNotEmpty()
    @IsDateString()
    startDate: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsString()
    responsibilities?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    lastSalary?: number;
}

export class CreateEmployeeProfileDto {
    @IsNotEmpty()
    @IsString()
    userId: string;

    // Personal Information
    @IsNotEmpty()
    @IsString()
    nationalId: string;

    @IsNotEmpty()
    @IsDateString()
    birthDate: string;

    @IsNotEmpty()
    @IsString()
    birthPlace: string;

    @IsNotEmpty()
    @IsEnum(['MALE', 'FEMALE'])
    gender: 'MALE' | 'FEMALE';

    @IsNotEmpty()
    @IsEnum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'])
    maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';

    @IsOptional()
    @IsNumber()
    @Min(0)
    childrenCount?: number;

    @IsOptional()
    @IsEnum(['COMPLETED', 'EXEMPTED', 'NOT_COMPLETED'])
    militaryStatus?: 'COMPLETED' | 'EXEMPTED' | 'NOT_COMPLETED';

    // Contact Information
    @IsNotEmpty()
    @IsPhoneNumber('IR')
    phoneNumber: string;

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
    @IsNotEmpty()
    @IsDateString()
    hireDate: string;

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
