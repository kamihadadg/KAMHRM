import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from './entities/contract.entity';
import { Assignment } from './entities/assignment.entity';
import { Position } from '../survey/entities/position.entity';

import { ContractController } from './contract.controller';
import { AssignmentController } from './assignment.controller';
import { ContractService } from './contract.service';
import { AssignmentService } from './assignment.service';

@Module({
    imports: [TypeOrmModule.forFeature([Contract, Assignment, Position])],
    controllers: [ContractController, AssignmentController],
    providers: [ContractService, AssignmentService],
    exports: [TypeOrmModule, ContractService, AssignmentService],
})
export class HrModule { }
