import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerformanceService } from './performance.service';
import { PerformanceController } from './performance.controller';
import { PerformanceEvaluation } from './entities/performance-evaluation.entity';
import { PerformanceGoal } from './entities/performance-goal.entity';
import { User } from '../survey/entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            PerformanceEvaluation,
            PerformanceGoal,
            User,
        ]),
    ],
    controllers: [PerformanceController],
    providers: [PerformanceService],
    exports: [PerformanceService],
})
export class PerformanceModule {}
