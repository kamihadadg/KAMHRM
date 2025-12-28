import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerformanceService } from './performance.service';
import { PerformanceController } from './performance.controller';
import { PerformanceEvaluation } from './entities/performance-evaluation.entity';
import { PerformanceGoal } from './entities/performance-goal.entity';
import { EvaluationTemplate } from './entities/evaluation-template.entity';
import { EvaluationCycle } from './entities/evaluation-cycle.entity';
import { User } from '../survey/entities/user.entity';
import { OrganizationHelpers } from './utils/organization-helpers';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            PerformanceEvaluation,
            PerformanceGoal,
            EvaluationTemplate,
            EvaluationCycle,
            User,
        ]),
    ],
    controllers: [PerformanceController],
    providers: [PerformanceService, OrganizationHelpers],
    exports: [PerformanceService],
})
export class PerformanceModule {}
