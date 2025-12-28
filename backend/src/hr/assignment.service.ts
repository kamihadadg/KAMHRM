import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectEntityManager } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { Contract } from './entities/contract.entity';
import { Position } from '../survey/entities/position.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { PaginationQuery, PaginatedResponse } from '../shared/interfaces/pagination.interface';

@Injectable()
export class AssignmentService {
    constructor(
        @InjectRepository(Assignment)
        private assignmentRepository: Repository<Assignment>,
        @InjectRepository(Contract)
        private contractRepository: Repository<Contract>,
        @InjectRepository(Position)
        private positionRepository: Repository<Position>,
        @InjectEntityManager()
        private entityManager: EntityManager,
    ) { }

    async create(createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
        console.log('[AssignmentService] Creating assignment:', createAssignmentDto);

        // Validate contract exists and is active
        const contract = await this.contractRepository.findOne({
            where: { id: createAssignmentDto.contractId },
            relations: ['assignments'],
        });

        if (!contract) {
            throw new NotFoundException('Contract not found');
        }

        if (contract.status !== 'ACTIVE') {
            throw new BadRequestException('Cannot create assignment for inactive contract');
        }

        // Validate position exists
        const position = await this.positionRepository.findOne({
            where: { id: createAssignmentDto.positionId },
        });

        if (!position) {
            throw new NotFoundException('Position not found');
        }

        // Validate total workload doesn't exceed 100%
        const currentTotalWorkload = contract.assignments.reduce((sum, a) => sum + a.workloadPercentage, 0);
        if (currentTotalWorkload + createAssignmentDto.workloadPercentage > 100) {
            throw new BadRequestException(
                `Total workload exceeds 100%. Current: ${currentTotalWorkload}%, Requested: ${createAssignmentDto.workloadPercentage}%`,
            );
        }

        const assignment = this.assignmentRepository.create(createAssignmentDto);
        const savedAssignment = await this.assignmentRepository.save(assignment);

        console.log('[AssignmentService] Assignment created successfully:', savedAssignment.id);

        return savedAssignment;
    }

    async findAll(query: PaginationQuery = {}): Promise<PaginatedResponse<Assignment>> {
        const {
            page = 1,
            limit = 10,
            search,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = query;

        const queryBuilder = this.assignmentRepository.createQueryBuilder('assignment')
            .leftJoinAndSelect('assignment.contract', 'contract')
            .leftJoinAndSelect('assignment.position', 'position')
            .leftJoinAndSelect('contract.user', 'user');

        // Apply search filter
        if (search) {
            queryBuilder.andWhere(
                '(position.title LIKE :search OR contract.title LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search)',
                { search: `%${search}%` }
            );
        }

        // Apply sorting
        queryBuilder.orderBy(`assignment.${sortBy}`, sortOrder);

        // Get total count
        const total = await queryBuilder.getCount();

        // Apply pagination
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        const assignments = await queryBuilder.getMany();

        const totalPages = Math.ceil(total / limit);

        return {
            data: assignments,
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

    async findOne(id: string): Promise<Assignment> {
        const assignment = await this.assignmentRepository.findOne({
            where: { id },
            relations: ['contract', 'contract.user', 'position'],
        });

        if (!assignment) {
            throw new NotFoundException(`Assignment with ID ${id} not found`);
        }

        return assignment;
    }

    async update(id: string, updateAssignmentDto: UpdateAssignmentDto): Promise<Assignment> {
        console.log('🔄 AssignmentService - Updating assignment:', id);
        console.log('📥 AssignmentService - Received data:', updateAssignmentDto);

        const assignment = await this.findOne(id);
        console.log('📋 AssignmentService - Current assignment:', {
            id: assignment.id,
            contractId: assignment.contractId,
            positionId: assignment.positionId,
            workloadPercentage: assignment.workloadPercentage
        });

        // If contract is being changed, validate the new contract
        if (updateAssignmentDto.contractId && updateAssignmentDto.contractId !== assignment.contractId) {
            console.log('🔄 AssignmentService - Contract is being changed:', updateAssignmentDto.contractId);
            const newContract = await this.contractRepository.findOne({
                where: { id: updateAssignmentDto.contractId },
                relations: ['assignments'],
            });

            if (!newContract) {
                throw new NotFoundException('New contract not found');
            }

            if (newContract.status !== 'ACTIVE') {
                throw new BadRequestException('Cannot assign to inactive contract');
            }

            // Validate workload for new contract
            const newContractWorkload = newContract.assignments.reduce((sum, a) => sum + a.workloadPercentage, 0);
            const workloadToCheck = updateAssignmentDto.workloadPercentage !== undefined ? updateAssignmentDto.workloadPercentage : assignment.workloadPercentage;

            if (newContractWorkload + workloadToCheck > 100) {
                throw new BadRequestException(
                    `Total workload for new contract exceeds 100%. Current: ${newContractWorkload}%, Requested: ${workloadToCheck}%`,
                );
            }
        }

        // If position is being changed, validate it exists
        if (updateAssignmentDto.positionId && updateAssignmentDto.positionId !== assignment.positionId) {
            console.log('🔄 AssignmentService - Position is being changed:', updateAssignmentDto.positionId);

            const position = await this.positionRepository.findOne({
                where: { id: updateAssignmentDto.positionId },
            });

            if (!position) {
                console.error('❌ AssignmentService - New position not found:', updateAssignmentDto.positionId);
                throw new NotFoundException('New position not found');
            }

            console.log('✅ AssignmentService - New position found:', position.title);
        } else {
            console.log('⏭️ AssignmentService - Position not changed or not provided');
        }

        // If workload is being updated (but contract is not changing), validate it for current contract
        if (updateAssignmentDto.workloadPercentage !== undefined && (!updateAssignmentDto.contractId || updateAssignmentDto.contractId === assignment.contractId)) {
            console.log('⚖️ AssignmentService - Validating workload for current contract');
            console.log('📊 AssignmentService - New workload:', updateAssignmentDto.workloadPercentage);

            const contract = await this.contractRepository.findOne({
                where: { id: assignment.contractId },
                relations: ['assignments'],
            });

            if (contract) {
                // Calculate total workload excluding current assignment
                const otherAssignments = contract.assignments.filter(a => a.id !== id);
                const currentTotalWorkload = otherAssignments.reduce((sum, a) => sum + a.workloadPercentage, 0);

                console.log('📊 AssignmentService - Current total workload (excluding this):', currentTotalWorkload);
                console.log('📊 AssignmentService - Total after update would be:', currentTotalWorkload + updateAssignmentDto.workloadPercentage);

                if (currentTotalWorkload + updateAssignmentDto.workloadPercentage > 100) {
                    console.error('❌ AssignmentService - Workload validation failed');
                    throw new BadRequestException(
                        `Total workload exceeds 100%. Current (excluding this): ${currentTotalWorkload}%, Requested: ${updateAssignmentDto.workloadPercentage}%`,
                    );
                }

                console.log('✅ AssignmentService - Workload validation passed');
            }
        } else {
            console.log('⏭️ AssignmentService - Workload validation skipped');
        }

        // Update fields
        console.log('💾 AssignmentService - Applying changes to assignment');
        Object.assign(assignment, updateAssignmentDto);

        // Clear position relation if positionId changed to force reload
        if (updateAssignmentDto.positionId && updateAssignmentDto.positionId !== assignment.positionId) {
            assignment.position = null as any;
            console.log('🧹 AssignmentService - Position relation cleared for reload');
        }

        console.log('💾 AssignmentService - Assignment after changes:', {
            id: assignment.id,
            contractId: assignment.contractId,
            positionId: assignment.positionId,
            workloadPercentage: assignment.workloadPercentage
        });

        // Use query builder to ensure direct database update
        const updateResult = await this.entityManager
            .createQueryBuilder()
            .update(Assignment)
            .set({
                positionId: updateAssignmentDto.positionId,
                contractId: updateAssignmentDto.contractId,
                startDate: updateAssignmentDto.startDate,
                endDate: updateAssignmentDto.endDate,
                workloadPercentage: updateAssignmentDto.workloadPercentage,
                isPrimary: updateAssignmentDto.isPrimary,
                customJobDescription: updateAssignmentDto.customJobDescription,
            })
            .where('id = :id', { id })
            .execute();

        console.log('✅ AssignmentService - Database update result:', updateResult);

        // Reload the updated assignment with relations
        const savedAssignment = await this.findOne(id);
        console.log('📋 AssignmentService - Reloaded assignment details:', {
            id: savedAssignment.id,
            positionId: savedAssignment.positionId,
            positionTitle: savedAssignment.position?.title
        });

        // Load position relation explicitly
        if (savedAssignment.positionId) {
            const position = await this.positionRepository.findOne({
                where: { id: savedAssignment.positionId }
            });
            if (position) {
                savedAssignment.position = position;
                console.log('🔗 AssignmentService - Position relation loaded:', position.title);
            } else {
                console.error('❌ AssignmentService - Position not found for ID:', savedAssignment.positionId);
            }
        }

        console.log('🔄 AssignmentService - Final assignment with position:', {
            id: savedAssignment.id,
            positionId: savedAssignment.positionId,
            positionTitle: savedAssignment.position?.title
        });

        return savedAssignment;
    }

    async remove(id: string): Promise<void> {
        const assignment = await this.findOne(id);
        await this.assignmentRepository.remove(assignment);

        console.log(`[AssignmentService] Assignment ${id} removed.`);
    }
}
