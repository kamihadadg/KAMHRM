import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  IsEmail,
} from 'class-validator';
import { UserRole } from '../../survey/entities/user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'کد پرسنلی الزامی است' })
  employeeId: string;

  @IsString()
  @IsNotEmpty({ message: 'نام کاربری الزامی است' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'نام الزامی است' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'نام خانوادگی الزامی است' })
  lastName: string;

  @IsOptional()
  @IsString()
  profileImageUrl?: string; // URL عکس پروفایل

  @IsString()
  @MinLength(6, { message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' })
  password: string;

  @IsOptional()
  @IsString()
  managerId?: string;

  @IsEnum(UserRole)
  role: UserRole;
}
