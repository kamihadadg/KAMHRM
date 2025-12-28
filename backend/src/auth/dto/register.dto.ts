import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../survey/entities/user.entity';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'کد پرسنلی الزامی است' })
  employeeId: string;

  @IsString()
  @IsNotEmpty({ message: 'نام الزامی است' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'نام خانوادگی الزامی است' })
  lastName: string;

  @IsEmail({}, { message: 'ایمیل معتبر نیست' })
  @IsNotEmpty({ message: 'ایمیل الزامی است' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' })
  password: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  managerId?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
