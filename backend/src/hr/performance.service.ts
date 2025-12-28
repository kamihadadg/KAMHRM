import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerformanceEvaluation, EvaluationStatus, EvaluationType } from './entities/performance-evaluation.entity';
import { PerformanceGoal, GoalStatus } from './entities/performance-goal.entity';
import { EvaluationTemplate } from './entities/evaluation-template.entity';
import { EvaluationCycle, CycleStatus } from './entities/evaluation-cycle.entity';
import { User } from '../survey/entities/user.entity';
import { CreatePerformanceEvaluationDto } from './dto/create-performance-evaluation.dto';
import { UpdatePerformanceEvaluationDto } from './dto/update-performance-evaluation.dto';
import { CreatePerformanceGoalDto } from './dto/create-performance-goal.dto';
import { UpdatePerformanceGoalDto } from './dto/update-performance-goal.dto';
import { CreateEvaluationTemplateDto } from './dto/create-evaluation-template.dto';
import { CreateEvaluationCycleDto } from './dto/create-evaluation-cycle.dto';
import { PublishEvaluationCycleDto } from './dto/publish-evaluation-cycle.dto';
import { OrganizationHelpers } from './utils/organization-helpers';
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
        @InjectRepository(EvaluationTemplate)
        private templateRepository: Repository<EvaluationTemplate>,
        @InjectRepository(EvaluationCycle)
        private cycleRepository: Repository<EvaluationCycle>,
        private organizationHelpers: OrganizationHelpers,
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

    // Evaluation Templates

    async createTemplate(createDto: CreateEvaluationTemplateDto, createdById?: string): Promise<EvaluationTemplate> {
        console.log('[PerformanceService] Creating template:', createDto);

        const template = this.templateRepository.create({
            ...createDto,
            createdById,
        });

        const saved = await this.templateRepository.save(template);
        console.log('[PerformanceService] Template created:', saved.id);

        return this.findTemplateById(saved.id);
    }

    async findAllTemplates(query: PaginationQuery = {}): Promise<PaginatedResponse<EvaluationTemplate>> {
        const {
            page = 1,
            limit = 10,
            search,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = query;

        const queryBuilder = this.templateRepository
            .createQueryBuilder('template')
            .leftJoinAndSelect('template.createdBy', 'createdBy');

        if (search) {
            queryBuilder.andWhere(
                '(template.title LIKE :search OR template.description LIKE :search)',
                { search: `%${search}%` }
            );
        }

        queryBuilder.orderBy(`template.${sortBy}`, sortOrder);

        const total = await queryBuilder.getCount();

        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        const templates = await queryBuilder.getMany();

        const totalPages = Math.ceil(total / limit);

        return {
            data: templates,
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

    async findTemplateById(id: string): Promise<EvaluationTemplate> {
        const template = await this.templateRepository.findOne({
            where: { id },
            relations: ['createdBy'],
        });

        if (!template) {
            throw new NotFoundException(`Evaluation template with ID ${id} not found`);
        }

        return template;
    }

    async updateTemplate(id: string, updateDto: Partial<CreateEvaluationTemplateDto>): Promise<EvaluationTemplate> {
        console.log('[PerformanceService] Updating template:', id);

        const template = await this.findTemplateById(id);
        Object.assign(template, updateDto);
        await this.templateRepository.save(template);

        console.log('[PerformanceService] Template updated:', id);
        return this.findTemplateById(id);
    }

    async deleteTemplate(id: string): Promise<void> {
        const template = await this.findTemplateById(id);
        await this.templateRepository.remove(template);
        console.log(`[PerformanceService] Template ${id} deleted`);
    }

    // Evaluation Cycles

    async createCycle(createDto: CreateEvaluationCycleDto): Promise<EvaluationCycle> {
        console.log('[PerformanceService] Creating cycle:', createDto);

        // Validate template exists
        const template = await this.findTemplateById(createDto.templateId);
        if (!template) {
            throw new NotFoundException('Template not found');
        }

        const cycle = this.cycleRepository.create({
            ...createDto,
            startDate: new Date(createDto.startDate),
            endDate: new Date(createDto.endDate),
            submissionDeadline: createDto.submissionDeadline ? new Date(createDto.submissionDeadline) : undefined,
        });

        const saved = await this.cycleRepository.save(cycle);
        console.log('[PerformanceService] Cycle created:', saved.id);

        return this.findCycleById(saved.id);
    }

    async findAllCycles(query: PaginationQuery = {}): Promise<PaginatedResponse<EvaluationCycle>> {
        const {
            page = 1,
            limit = 10,
            search,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = query;

        const queryBuilder = this.cycleRepository
            .createQueryBuilder('cycle')
            .leftJoinAndSelect('cycle.template', 'template')
            .leftJoinAndSelect('cycle.publishedBy', 'publishedBy');

        if (search) {
            queryBuilder.andWhere(
                '(cycle.title LIKE :search OR cycle.description LIKE :search OR template.title LIKE :search)',
                { search: `%${search}%` }
            );
        }

        queryBuilder.orderBy(`cycle.${sortBy}`, sortOrder);

        const total = await queryBuilder.getCount();

        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        const cycles = await queryBuilder.getMany();

        const totalPages = Math.ceil(total / limit);

        return {
            data: cycles,
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

    async findCycleById(id: string): Promise<EvaluationCycle> {
        const cycle = await this.cycleRepository.findOne({
            where: { id },
            relations: ['template', 'publishedBy'],
        });

        if (!cycle) {
            throw new NotFoundException(`Evaluation cycle with ID ${id} not found`);
        }

        return cycle;
    }

    async publishCycle(cycleId: string, publishDto: PublishEvaluationCycleDto, publishedById: string): Promise<{ cycle: EvaluationCycle; evaluationsCreated: number }> {
        console.log('[PerformanceService] Publishing cycle:', cycleId);

        const cycle = await this.findCycleById(cycleId);

        if (cycle.status === CycleStatus.PUBLISHED) {
            throw new BadRequestException('Cycle is already published. Use republish instead.');
        }

        if (cycle.status === CycleStatus.CLOSED) {
            throw new BadRequestException('Cannot publish a closed cycle');
        }

        // دریافت لیست پرسنل بر اساس چارت سازمانی
        let targetEmployees: User[];
        if (publishDto.targetEmployeeIds && publishDto.targetEmployeeIds.length > 0) {
            // اگر لیست پرسنل مشخص شده باشد
            targetEmployees = await this.userRepository.find({
                where: publishDto.targetEmployeeIds.map(id => ({ id, isActive: true })),
                relations: ['manager'],
            });
        } else {
            // دریافت همه پرسنل فعال
            const allEmployees = await this.organizationHelpers.getEmployeesByHierarchy();
            // Load manager relations
            targetEmployees = await this.userRepository.find({
                where: allEmployees.map(emp => ({ id: emp.id })),
                relations: ['manager'],
            });
        }

        const template = await this.findTemplateById(cycle.templateId);
        const evaluationsCreated: PerformanceEvaluation[] = [];

        // ایجاد ارزیابی‌ها برای هر پرسنل و هر نوع ارزیابی
        for (const employee of targetEmployees) {
            for (const evaluationType of cycle.evaluationTypes) {
                let evaluatorId: string | undefined;

                switch (evaluationType) {
                    case EvaluationType.SELF:
                        evaluatorId = employee.id;
                        break;

                    case EvaluationType.MANAGER:
                        if (employee.managerId) {
                            evaluatorId = employee.managerId;
                        } else {
                            continue; // اگر مدیر ندارد، این نوع ارزیابی را ایجاد نکن
                        }
                        break;

                    case EvaluationType.SUBORDINATE:
                        // برای هر زیرمجموعه یک ارزیابی ایجاد می‌کنیم
                        const subordinates = await this.organizationHelpers.getSubordinates(employee.id);
                        for (const subordinate of subordinates) {
                            const evaluation = this.evaluationRepository.create({
                                employeeId: employee.id,
                                evaluatorId: subordinate.id,
                                evaluationType: EvaluationType.SUBORDINATE,
                                cycleId: cycle.id,
                                templateId: cycle.templateId,
                                period: `${cycle.startDate.toISOString().split('T')[0]}_${cycle.endDate.toISOString().split('T')[0]}`,
                                startDate: cycle.startDate,
                                endDate: cycle.endDate,
                                categories: JSON.parse(JSON.stringify(template.categories)), // کپی عمیق
                                status: EvaluationStatus.DRAFT,
                                isRepublished: false,
                            });
                            evaluationsCreated.push(await this.evaluationRepository.save(evaluation));
                        }
                        continue; // continue به loop بعدی، چون ارزیابی‌ها را ایجاد کردیم

                    case EvaluationType.PEER:
                        // برای هر هم‌ردیف یک ارزیابی ایجاد می‌کنیم
                        const peers = await this.organizationHelpers.getPeers(employee.id);
                        for (const peer of peers) {
                            const evaluation = this.evaluationRepository.create({
                                employeeId: employee.id,
                                evaluatorId: peer.id,
                                evaluationType: EvaluationType.PEER,
                                cycleId: cycle.id,
                                templateId: cycle.templateId,
                                period: `${cycle.startDate.toISOString().split('T')[0]}_${cycle.endDate.toISOString().split('T')[0]}`,
                                startDate: cycle.startDate,
                                endDate: cycle.endDate,
                                categories: JSON.parse(JSON.stringify(template.categories)), // کپی عمیق
                                status: EvaluationStatus.DRAFT,
                                isRepublished: false,
                            });
                            evaluationsCreated.push(await this.evaluationRepository.save(evaluation));
                        }
                        continue; // continue به loop بعدی، چون ارزیابی‌ها را ایجاد کردیم
                }

                // برای SELF و MANAGER که evaluatorId مشخص است
                if (evaluatorId) {
                    const evaluation = this.evaluationRepository.create({
                        employeeId: employee.id,
                        evaluatorId,
                        evaluationType: evaluationType,
                        cycleId: cycle.id,
                        templateId: cycle.templateId,
                        period: `${cycle.startDate.toISOString().split('T')[0]}_${cycle.endDate.toISOString().split('T')[0]}`,
                        startDate: cycle.startDate,
                        endDate: cycle.endDate,
                        categories: JSON.parse(JSON.stringify(template.categories)), // کپی عمیق
                        status: EvaluationStatus.DRAFT,
                        isRepublished: false,
                    });
                    evaluationsCreated.push(await this.evaluationRepository.save(evaluation));
                }
            }
        }

        // به‌روزرسانی وضعیت دوره
        cycle.status = CycleStatus.PUBLISHED;
        cycle.publishedAt = new Date();
        cycle.publishedById = publishedById;
        await this.cycleRepository.save(cycle);

        console.log(`[PerformanceService] Cycle published: ${cycleId}, ${evaluationsCreated.length} evaluations created`);

        return {
            cycle: await this.findCycleById(cycleId),
            evaluationsCreated: evaluationsCreated.length,
        };
    }

    async republishCycle(cycleId: string, publishDto: PublishEvaluationCycleDto, publishedById: string): Promise<{ cycle: EvaluationCycle; evaluationsCreated: number }> {
        console.log('[PerformanceService] Republishing cycle:', cycleId);

        const cycle = await this.findCycleById(cycleId);

        // حذف ارزیابی‌های موجود این دوره
        const existingEvaluations = await this.evaluationRepository.find({
            where: { cycleId: cycle.id },
        });

        if (existingEvaluations.length > 0) {
            await this.evaluationRepository.remove(existingEvaluations);
            console.log(`[PerformanceService] Deleted ${existingEvaluations.length} existing evaluations`);
        }

        // انتشار مجدد
        return this.publishCycle(cycleId, publishDto, publishedById);
    }

    async getCycleEvaluations(cycleId: string, query: PaginationQuery = {}): Promise<PaginatedResponse<PerformanceEvaluation>> {
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
            .leftJoinAndSelect('evaluation.evaluator', 'evaluator')
            .where('evaluation.cycleId = :cycleId', { cycleId });

        if (search) {
            queryBuilder.andWhere(
                '(employee.firstName LIKE :search OR employee.lastName LIKE :search OR evaluator.firstName LIKE :search OR evaluator.lastName LIKE :search)',
                { search: `%${search}%` }
            );
        }

        queryBuilder.orderBy(`evaluation.${sortBy}`, sortOrder);

        const total = await queryBuilder.getCount();

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
}
