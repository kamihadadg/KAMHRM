import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from './entities/contract.entity';
import { Assignment } from './entities/assignment.entity';
import { EmployeeProfile } from './entities/employee-profile.entity';
import { Position } from '../survey/entities/position.entity';
import { User } from '../survey/entities/user.entity';

import { ContractController } from './contract.controller';
import { AssignmentController } from './assignment.controller';
import { EmployeeProfileController } from './employee-profile.controller';
import { ContractService } from './contract.service';
import { AssignmentService } from './assignment.service';
import { EmployeeProfileService } from './employee-profile.service';

import { PerformanceModule } from './performance.module';
import { SeederModule } from './seeder.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Contract, Assignment, EmployeeProfile, Position, User]),
        PerformanceModule,
        SeederModule,
    ],
    controllers: [ContractController, AssignmentController, EmployeeProfileController],
    providers: [ContractService, AssignmentService, EmployeeProfileService],
    exports: [TypeOrmModule, ContractService, AssignmentService, EmployeeProfileService],
})
export class HrModule { }
