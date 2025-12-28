import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerformanceEvaluation, EvaluationStatus } from './entities/performance-evaluation.entity';
import { PerformanceGoal, GoalStatus } from './entities/performance-goal.entity';
import { User } from '../survey/entities/user.entity';
import { CreatePerformanceEvaluationDto } from './dto/create-performance-evaluation.dto';
import { UpdatePerformanceEvaluationDto } from './dto/update-performance-evaluation.dto';
import { CreatePerformanceGoalDto } from './dto/create-performance-goal.dto';
import { UpdatePerformanceGoalDto } from './dto/update-performance-goal.dto';
import { PaginationQuery, PaginatedResponse } from '../shared/interfaces/pagination.interface';

@Injectable()
export class PerformanceService {
    constructor(
        @InjectRepository(PerformanceEvaluation)
        private evaluationRepository: Repository<PerformanceEvaluation>,
        @InjectRepository(PerformanceGoal)
        private goalRepository: Repository<PerformanceGoal>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    // Performance Evaluations

    async createEvaluation(createDto: CreatePerformanceEvaluationDto): Promise<PerformanceEvaluation> {
        console.log('[PerformanceService] Creating evaluation:', createDto);

        // Validate employee exists
        const employee = await this.userRepository.findOne({ where: { id: createDto.employeeId } });
        if (!employee) {
            throw new NotFoundException('Employee not found');
        }

        // Validate evaluator exists
        const evaluator = await this.userRepository.findOne({ where: { id: createDto.evaluatorId } });
        if (!evaluator) {
            throw new NotFoundException('Evaluator not found');
        }

        // Check for duplicate evaluation in same period
        const existing = await this.evaluationRepository.findOne({
            where: {
                employeeId: createDto.employeeId,
                evaluatorId: createDto.evaluatorId,
                evaluationType: createDto.evaluationType,
                period: createDto.period,
            },
        });

        if (existing) {
            throw new BadRequestException('Evaluation already exists for this employee, evaluator, type and period');
        }

        const evaluation = this.evaluationRepository.create({
            ...createDto,
            startDate: new Date(createDto.startDate),
            endDate: new Date(createDto.endDate),
        });

        const saved = await this.evaluationRepository.save(evaluation);
        console.log('[PerformanceService] Evaluation created:', saved.id);

        return this.findEvaluationById(saved.id);
    }

    async findAllEvaluations(
        query: PaginationQuery = {},
        employeeId?: string,
        evaluatorId?: string
    ): Promise<PaginatedResponse<PerformanceEvaluation>> {
        const {
            page = 1,
            limit = 10,
            search,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = query;

        const queryBuilder = this.evaluationRepository
            .createQueryBuilder('evaluation')
            .leftJoinAndSelect('evaluation.employee', 'employee')
            .leftJoinAndSelect('evaluation.evaluator', 'evaluator');

        if (employeeId) {
            queryBuilder.andWhere('evaluation.employeeId = :employeeId', { employeeId });
        }

        if (evaluatorId) {
            queryBuilder.andWhere('evaluation.evaluatorId = :evaluatorId', { evaluatorId });
        }

        // Apply search filter
        if (search) {
            queryBuilder.andWhere(
                '(evaluation.period LIKE :search OR employee.firstName LIKE :search OR employee.lastName LIKE :search OR evaluator.firstName LIKE :search OR evaluator.lastName LIKE :search)',
                { search: `%${search}%` }
            );
        }

        // Apply sorting
        queryBuilder.orderBy(`evaluation.${sortBy}`, sortOrder);

        // Get total count
        const total = await queryBuilder.getCount();

        // Apply pagination
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        const evaluations = await queryBuilder.getMany();

        const totalPages = Math.ceil(total / limit);

        return {
            data: evaluations,
            meta: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    }

    async findEvaluationById(id: string): Promise<PerformanceEvaluation> {
        const evaluation = await this.evaluationRepository.findOne({
            where: { id },
            relations: ['employee', 'evaluator'],
        });

        if (!evaluation) {
            throw new NotFoundException(`Performance evaluation with ID ${id} not found`);
        }

        return evaluation;
    }

    async updateEvaluation(id: string, updateDto: UpdatePerformanceEvaluationDto): Promise<PerformanceEvaluation> {
        console.log('[PerformanceService] Updating evaluation:', id);

        const evaluation = await this.findEvaluationById(id);

        // Update dates if provided
        if (updateDto.startDate) {
            updateDto.startDate = new Date(updateDto.startDate) as any;
        }
        if (updateDto.endDate) {
            updateDto.endDate = new Date(updateDto.endDate) as any;
        }

        // Update submittedAt when status changes to SUBMITTED
        if (updateDto.status === EvaluationStatus.SUBMITTED && evaluation.status !== EvaluationStatus.SUBMITTED) {
            (updateDto as any).submittedAt = new Date();
        }

        // Update reviewedAt when status changes to REVIEWED or APPROVED
        if ((updateDto.status === EvaluationStatus.REVIEWED || updateDto.status === EvaluationStatus.APPROVED) &&
            ![EvaluationStatus.REVIEWED, EvaluationStatus.APPROVED].includes(evaluation.status)) {
            (updateDto as any).reviewedAt = new Date();
        }

        Object.assign(evaluation, updateDto);
        await this.evaluationRepository.save(evaluation);

        console.log('[PerformanceService] Evaluation updated:', id);
        return this.findEvaluationById(id);
    }

    async deleteEvaluation(id: string): Promise<void> {
        const evaluation = await this.findEvaluationById(id);
        await this.evaluationRepository.remove(evaluation);
        console.log(`[PerformanceService] Evaluation ${id} deleted`);
    }

    // Performance Goals

    async createGoal(createDto: CreatePerformanceGoalDto): Promise<PerformanceGoal> {
        console.log('[PerformanceService] Creating goal:', createDto);

        // Validate employee exists
        const employee = await this.userRepository.findOne({ where: { id: createDto.employeeId } });
        if (!employee) {
            throw new NotFoundException('Employee not found');
        }

        // Validate setter if provided
        if (createDto.setterId) {
            const setter = await this.userRepository.findOne({ where: { id: createDto.setterId } });
            if (!setter) {
                throw new NotFoundException('Goal setter not found');
            }
        }

        const goal = this.goalRepository.create({
            ...createDto,
            deadline: new Date(createDto.deadline),
        });

        const saved = await this.goalRepository.save(goal);
        console.log('[PerformanceService] Goal created:', saved.id);

        return this.findGoalById(saved.id);
    }

    async findAllGoals(
        query: PaginationQuery = {},
        employeeId?: string,
        status?: GoalStatus
    ): Promise<PaginatedResponse<PerformanceGoal>> {
        const {
            page = 1,
            limit = 10,
            search,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = query;

        const queryBuilder = this.goalRepository
            .createQueryBuilder('goal')
            .leftJoinAndSelect('goal.employee', 'employee')
            .leftJoinAndSelect('goal.setter', 'setter')
            .leftJoinAndSelect('goal.parentGoal', 'parentGoal');

        if (employeeId) {
            queryBuilder.andWhere('goal.employeeId = :employeeId', { employeeId });
        }

        if (status) {
            queryBuilder.andWhere('goal.status = :status', { status });
        }

        // Apply search filter
        if (search) {
            queryBuilder.andWhere(
                '(goal.title LIKE :search OR goal.description LIKE :search OR employee.firstName LIKE :search OR employee.lastName LIKE :search)',
                { search: `%${search}%` }
            );
        }

        // Apply sorting
        queryBuilder.orderBy(`goal.${sortBy}`, sortOrder);

        // Get total count
        const total = await queryBuilder.getCount();

        // Apply pagination
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        const goals = await queryBuilder.getMany();

        const totalPages = Math.ceil(total / limit);

        return {
            data: goals,
            meta: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    }

    async findGoalById(id: string): Promise<PerformanceGoal> {
        const goal = await this.goalRepository.findOne({
            where: { id },
            relations: ['employee', 'setter', 'parentGoal'],
        });

        if (!goal) {
            throw new NotFoundException(`Performance goal with ID ${id} not found`);
        }

        return goal;
    }

    async updateGoal(id: string, updateDto: UpdatePerformanceGoalDto): Promise<PerformanceGoal> {
        console.log('[PerformanceService] Updating goal:', id);

        const goal = await this.findGoalById(id);

        // Update deadline if provided
        if (updateDto.deadline) {
            updateDto.deadline = new Date(updateDto.deadline) as any;
        }

        // Auto-update status based on progress
        if (updateDto.progress === 100 && goal.status === GoalStatus.ACTIVE) {
            (updateDto as any).status = GoalStatus.COMPLETED;
            (updateDto as any).completedAt = new Date();
        }

        // Check for overdue goals
        if (new Date() > goal.deadline && goal.status === GoalStatus.ACTIVE) {
            (updateDto as any).status = GoalStatus.OVERDUE;
        }

        Object.assign(goal, updateDto);
        await this.goalRepository.save(goal);

        console.log('[PerformanceService] Goal updated:', id);
        return this.findGoalById(id);
    }

    async deleteGoal(id: string): Promise<void> {
        const goal = await this.findGoalById(id);
        await this.goalRepository.remove(goal);
        console.log(`[PerformanceService] Goal ${id} deleted`);
    }

    // Utility methods

    async getEmployeeEvaluations(employeeId: string, period?: string): Promise<PerformanceEvaluation[]> {
        const query = this.evaluationRepository
            .createQueryBuilder('evaluation')
            .leftJoinAndSelect('evaluation.employee', 'employee')
            .leftJoinAndSelect('evaluation.evaluator', 'evaluator')
            .where('evaluation.employeeId = :employeeId', { employeeId })
            .orderBy('evaluation.createdAt', 'DESC');

        if (period) {
            query.andWhere('evaluation.period = :period', { period });
        }

        return query.getMany();
    }

    async getEvaluationStatistics(employeeId: string): Promise<any> {
        const evaluations = await this.getEmployeeEvaluations(employeeId);

        if (evaluations.length === 0) {
            return { averageRating: 0, totalEvaluations: 0, lastEvaluationDate: null };
        }

        const validRatings = evaluations.filter(e => e.overallRating).map(e => e.overallRating!);
        const averageRating = validRatings.length > 0 ?
            validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length : 0;

        const lastEvaluation = evaluations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

        return {
            averageRating: Math.round(averageRating * 100) / 100,
            totalEvaluations: evaluations.length,
            lastEvaluationDate: lastEvaluation.createdAt,
        };
    }
}
