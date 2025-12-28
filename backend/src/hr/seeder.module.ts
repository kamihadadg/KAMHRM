import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { SeederController } from './seeder.controller';
import { User } from '../survey/entities/user.entity';
import { Position } from '../survey/entities/position.entity';
import { EmployeeProfile } from './entities/employee-profile.entity';
import { PerformanceEvaluation } from './entities/performance-evaluation.entity';
import { PerformanceGoal } from './entities/performance-goal.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Position,
            EmployeeProfile,
            PerformanceEvaluation,
            PerformanceGoal,
        ]),
    ],
    controllers: [SeederController],
    providers: [SeederService],
})
export class SeederModule {}
