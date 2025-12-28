import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsEmail,
} from 'class-validator';
import { UserRole } from '../../survey/entities/user.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  profileImageUrl?: string; // URL عکس پروفایل

  @IsOptional()
  @IsString()
  managerId?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
