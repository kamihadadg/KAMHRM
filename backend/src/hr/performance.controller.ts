import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
} from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { CreatePerformanceEvaluationDto } from './dto/create-performance-evaluation.dto';
import { UpdatePerformanceEvaluationDto } from './dto/update-performance-evaluation.dto';
import { CreatePerformanceGoalDto } from './dto/create-performance-goal.dto';
import { UpdatePerformanceGoalDto } from './dto/update-performance-goal.dto';
import { GoalStatus } from './entities/performance-goal.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { PaginationQuery } from '../shared/interfaces/pagination.interface';

@Controller('hr/performance')
@UseGuards(JwtAuthGuard)
export class PerformanceController {
    constructor(private readonly performanceService: PerformanceService) {}

    // Performance Evaluations

    @Post('evaluations')
    createEvaluation(@Body() createDto: CreatePerformanceEvaluationDto) {
        return this.performanceService.createEvaluation(createDto);
    }

    @Get('evaluations')
    findAllEvaluations(
        @Query() query: PaginationQuery,
        @Query('employeeId') employeeId?: string,
        @Query('evaluatorId') evaluatorId?: string,
    ) {
        return this.performanceService.findAllEvaluations(query, employeeId, evaluatorId);
    }

    @Get('evaluations/:id')
    findEvaluationById(@Param('id') id: string) {
        return this.performanceService.findEvaluationById(id);
    }

    @Patch('evaluations/:id')
    updateEvaluation(
        @Param('id') id: string,
        @Body() updateDto: UpdatePerformanceEvaluationDto,
    ) {
        return this.performanceService.updateEvaluation(id, updateDto);
    }

    @Delete('evaluations/:id')
    deleteEvaluation(@Param('id') id: string) {
        return this.performanceService.deleteEvaluation(id);
    }

    // Employee specific evaluations
    @Get('employees/:employeeId/evaluations')
    getEmployeeEvaluations(
        @Param('employeeId') employeeId: string,
        @Query('period') period?: string,
    ) {
        return this.performanceService.getEmployeeEvaluations(employeeId, period);
    }

    // Evaluation statistics
    @Get('employees/:employeeId/statistics')
    getEvaluationStatistics(@Param('employeeId') employeeId: string) {
        return this.performanceService.getEvaluationStatistics(employeeId);
    }

    // Performance Goals

    @Post('goals')
    createGoal(@Body() createDto: CreatePerformanceGoalDto) {
        return this.performanceService.createGoal(createDto);
    }

    @Get('goals')
    findAllGoals(
        @Query() query: PaginationQuery,
        @Query('employeeId') employeeId?: string,
        @Query('status') status?: GoalStatus,
    ) {
        return this.performanceService.findAllGoals(query, employeeId, status);
    }

    @Get('goals/:id')
    findGoalById(@Param('id') id: string) {
        return this.performanceService.findGoalById(id);
    }

    @Patch('goals/:id')
    updateGoal(
        @Param('id') id: string,
        @Body() updateDto: UpdatePerformanceGoalDto,
    ) {
        return this.performanceService.updateGoal(id, updateDto);
    }

    @Delete('goals/:id')
    deleteGoal(@Param('id') id: string) {
        return this.performanceService.deleteGoal(id);
    }
}
