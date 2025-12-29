import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Put,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreatePositionDto } from './dto/create-position.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserRole } from '../survey/entities/user.entity';
import type { PaginationQuery } from '../shared/interfaces/pagination.interface';
import { Query } from '@nestjs/common';

// Multer config for profile image upload
const profileImageStorage = diskStorage({
  destination: './uploads/profiles',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = extname(file.originalname);
    callback(null, `profile-${uniqueSuffix}${ext}`);
  },
});

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }


  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(req.user.id, changePasswordDto);
    return { message: 'رمز عبور با موفقیت تغییر یافت' };
  }

  // Admin User Management Endpoints
  @UseGuards(JwtAuthGuard)
  @Post('admin/users')
  async createUser(@Request() req, @Body() createUserDto: CreateUserDto) {
    // Check if user is admin
    if (req.user.role !== UserRole.SUPERADMIN) {
      throw new Error('دسترسی غیرمجاز');
    }
    const user = await this.authService.createUser(createUserDto);
    return { message: 'کاربر با موفقیت ایجاد شد', user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/users')
  async getAllUsers(
    @Request() req,
    @Query() query: PaginationQuery
  ) {
    // Check if user is admin
    if (req.user.role !== UserRole.SUPERADMIN) {
      throw new Error('دسترسی غیرمجاز');
    }
    return this.authService.getAllUsers(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/users/:id')
  async getUserById(@Request() req, @Param('id') id: string) {
    // Check if user is admin
    if (req.user.role !== UserRole.SUPERADMIN) {
      throw new Error('دسترسی غیرمجاز');
    }
    return this.authService.getUserById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/users/:id')
  async updateUser(
    @Request() req,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    // Check if user is admin
    if (req.user.role !== UserRole.SUPERADMIN) {
      throw new Error('دسترسی غیرمجاز');
    }
    const user = await this.authService.updateUser(id, updateUserDto);
    return { message: 'کاربر با موفقیت به‌روزرسانی شد', user };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/users/:id')
  async deleteUser(@Request() req, @Param('id') id: string) {
    // Check if user is admin
    if (req.user.role !== UserRole.SUPERADMIN) {
      throw new Error('دسترسی غیرمجاز');
    }
    await this.authService.deleteUser(id);
    return { message: 'کاربر با موفقیت حذف شد' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/users/:id/reset-password')
  async resetUserPassword(@Request() req, @Param('id') id: string) {
    // Check if user is admin
    if (req.user.role !== UserRole.SUPERADMIN) {
      throw new Error('دسترسی غیرمجاز');
    }
    const result = await this.authService.resetUserPassword(id);
    return result;
  }


  // Admin Position Management Endpoints
  @UseGuards(JwtAuthGuard)
  @Post('admin/positions')
  async createPosition(@Request() req, @Body() createPositionDto: CreatePositionDto) {
    // Check if user is admin
    if (req.user.role !== UserRole.SUPERADMIN) {
      throw new Error('دسترسی غیرمجاز');
    }
    const position = await this.authService.createPosition(createPositionDto);
    return { message: 'سمت با موفقیت ایجاد شد', position };
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/positions')
  async getAllPositions(
    @Request() req,
    @Query() query: PaginationQuery
  ) {
    // Check if user is admin
    if (req.user.role !== UserRole.SUPERADMIN) {
      throw new Error('دسترسی غیرمجاز');
    }
    return this.authService.getAllPositions(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/positions/flat')
  async getAllPositionsFlat(@Request() req) {
    // Check if user is admin
    if (req.user.role !== UserRole.SUPERADMIN) {
      throw new Error('دسترسی غیرمجاز');
    }
    return this.authService.getAllPositionsFlat();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/positions/:id')
  async getPositionById(@Request() req, @Param('id') id: string) {
    // Check if user is admin
    if (req.user.role !== UserRole.SUPERADMIN) {
      throw new Error('دسترسی غیرمجاز');
    }
    return this.authService.getPositionById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/positions/reset-layout')
  async resetOrgChartLayout(@Request() req) {
    // Check if user is admin
    if (req.user.role !== UserRole.SUPERADMIN) {
      throw new Error('دسترسی غیرمجاز');
    }
    await this.authService.resetAllPositionCoordinates();
    return { message: 'چیدمان به حالت پیش‌فرض بازگشت' };
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/positions/:id')
  async updatePosition(
    @Request() req,
    @Param('id') id: string,
    @Body() updateData: Partial<CreatePositionDto>,
  ) {
    // Check if user is admin
    if (req.user.role !== UserRole.SUPERADMIN) {
      throw new Error('دسترسی غیرمجاز');
    }
    const position = await this.authService.updatePosition(id, updateData);
    return { message: 'سمت با موفقیت به‌روزرسانی شد', position };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/positions/:id')
  async deletePosition(@Request() req, @Param('id') id: string) {
    // Check if user is admin
    if (req.user.role !== UserRole.SUPERADMIN) {
      throw new Error('دسترسی غیرمجاز');
    }
    await this.authService.deletePosition(id);
    return { message: 'سمت با موفقیت حذف شد' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/org-chart')
  async getOrganizationalChart(@Request() req) {
    // Check if user is admin
    if (req.user.role !== UserRole.SUPERADMIN) {
      throw new Error('دسترسی غیرمجاز');
    }
    return this.authService.getOrganizationalChart();
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/positions/:id/parent')
  async updatePositionParent(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { parentPositionId: string | null }
  ) {
    // Check if user is admin
    if (req.user.role !== UserRole.SUPERADMIN) {
      throw new Error('دسترسی غیرمجاز');
    }
    const position = await this.authService.updatePositionOrder(id, body.parentPositionId);
    return { message: 'ترتیب سمت با موفقیت به‌روزرسانی شد', position };
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/positions/:id/coordinates')
  async updatePositionCoordinates(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { x: number | null, y: number | null }
  ) {
    // Check if user is admin
    if (req.user.role !== UserRole.SUPERADMIN) {
      throw new Error('دسترسی غیرمجاز');
    }
    await this.authService.updatePositionCoordinates(id, body.x, body.y);
    return { message: 'مختصات با موفقیت ذخیره شد' };
  }



  @UseGuards(JwtAuthGuard)
  @Post('upload/profile-image')
  @UseInterceptors(FileInterceptor('file', {
    storage: profileImageStorage,
    limits: {
      fileSize: 2 * 1024 * 1024, // 2MB
    },
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('فقط فایل‌های تصویری مجاز هستند'), false);
      }
      callback(null, true);
    },
  }))
  async uploadProfileImage(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (!file) {
      throw new Error('فایل آپلود نشد');
    }

    // Return the file path that can be accessed via HTTP
    const fileUrl = `/uploads/profiles/${file.filename}`;

    return {
      message: 'تصویر پروفایل با موفقیت آپلود شد',
      fileUrl,
      filename: file.filename,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('debug/positions')
  async debugPositions(@Request() req) {
    // Check if user is admin
    if (req.user.role !== UserRole.SUPERADMIN) {
      throw new Error('دسترسی غیرمجاز');
    }
    const positions = await this.authService.getAllPositionsFlat();
    return {
      count: positions.length,
      positions: positions.map(p => ({
        id: p.id,
        title: p.title,
        idLength: p.id.length,
        isValidGuid: p.id.length === 36 && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p.id)
      }))
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('debug/cleanup-invalid-positions')
  async cleanupInvalidPositions(@Request() req) {
    // Check if user is admin
    if (req.user.role !== UserRole.SUPERADMIN) {
      throw new Error('دسترسی غیرمجاز');
    }

    const positions = await this.authService.getAllPositionsFlat();
    const invalidPositions = positions.filter(p =>
      !p.id || typeof p.id !== 'string' || p.id.length !== 36 ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p.id)
    );

    console.log('Found invalid positions:', invalidPositions);

    let deletedCount = 0;
    for (const pos of invalidPositions) {
      try {
        await this.authService.deletePosition(pos.id);
        deletedCount++;
        console.log(`Deleted invalid position: ${pos.title} (${pos.id})`);
      } catch (error) {
        console.error(`Failed to delete position ${pos.id}:`, error);
      }
    }

    return {
      message: `پاکسازی کامل شد. ${deletedCount} رکورد نامعتبر حذف شد.`,
      deletedCount,
      invalidPositions: invalidPositions.map(p => ({ id: p.id, title: p.title }))
    };
  }
}
