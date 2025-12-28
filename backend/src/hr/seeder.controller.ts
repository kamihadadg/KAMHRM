import {
    Controller,
    Post,
    Delete,
    Get,
    UseGuards,
} from '@nestjs/common';
import { SeederService } from './seeder.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface SeederResult {
    positions: number;
    users: number;
    goals: number;
    evaluations: number;
    errors: string[];
}

@Controller('hr/seeder')
@UseGuards(JwtAuthGuard)
export class SeederController {
    constructor(private readonly seederService: SeederService) {}

    @Post('seed')
    async seedTestData(): Promise<{success: boolean; message: string; data: SeederResult}> {
        console.log('[SeederController] شروع seeding داده‌های تستی');
        const result = await this.seederService.seedTestData();
        return {
            success: true,
            message: 'داده‌های تستی با موفقیت ایجاد شد',
            data: result
        };
    }

    @Delete('clear')
    async clearTestData(): Promise<{success: boolean; message: string; data: SeederResult}> {
        console.log('[SeederController] شروع پاک کردن داده‌های تستی');
        const result = await this.seederService.clearTestData();
        return {
            success: true,
            message: 'داده‌های تستی با موفقیت پاک شد',
            data: result
        };
    }

    @Get('stats')
    async getStats() {
        console.log('[SeederController] دریافت آمار seeder');
        const stats = await this.seederService.getSeederStats();
        return {
            success: true,
            data: stats
        };
    }
}
