import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract, ContractStatus } from './entities/contract.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { PaginationQuery, PaginatedResponse } from '../shared/interfaces/pagination.interface';

@Injectable()
export class ContractService {
    constructor(
        @InjectRepository(Contract)
        private contractRepository: Repository<Contract>,
    ) { }

    async create(createContractDto: CreateContractDto): Promise<Contract> {
        const contract = this.contractRepository.create({
            ...createContractDto,
            status: ContractStatus.DRAFT, // Default to DRAFT
        });
        return this.contractRepository.save(contract);
    }

    async findAll(query: PaginationQuery = {}): Promise<PaginatedResponse<Contract>> {
        const {
            page = 1,
            limit = 10,
            search,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = query;

        const queryBuilder = this.contractRepository.createQueryBuilder('contract')
            .leftJoinAndSelect('contract.user', 'user')
            .leftJoinAndSelect('contract.assignments', 'assignments');

        // Apply search filter
        if (search) {
            queryBuilder.andWhere(
                '(user.firstName LIKE :search OR user.lastName LIKE :search OR user.employeeId LIKE :search OR user.username LIKE :search OR contract.contractType LIKE :search OR contract.status LIKE :search)',
                { search: `%${search}%` }
            );
        }

        // Apply sorting
        queryBuilder.orderBy(`contract.${sortBy}`, sortOrder);

        // Get total count
        const total = await queryBuilder.getCount();

        // Apply pagination
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        const contracts = await queryBuilder.getMany();

        const totalPages = Math.ceil(total / limit);

        return {
            data: contracts,
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

    async findOne(id: string): Promise<Contract> {
        const contract = await this.contractRepository.findOne({
            where: { id },
            relations: ['user', 'assignments', 'assignments.position'],
        });
        if (!contract) {
            throw new NotFoundException(`Contract with ID ${id} not found`);
        }
        return contract;
    }

    async updateStatus(id: string, status: ContractStatus): Promise<Contract> {
        const contract = await this.findOne(id);
        contract.status = status;
        return this.contractRepository.save(contract);
    }

    async update(id: string, updateData: Partial<Contract>): Promise<Contract> {
        const contract = await this.findOne(id);

        // Update allowed fields
        if (updateData.startDate) contract.startDate = updateData.startDate;
        if (updateData.endDate !== undefined) contract.endDate = updateData.endDate;
        if (updateData.contractType) contract.contractType = updateData.contractType;
        if (updateData.fileUrl !== undefined) contract.fileUrl = updateData.fileUrl;

        return this.contractRepository.save(contract);
    }

    async remove(id: string): Promise<void> {
        const contract = await this.findOne(id);
        await this.contractRepository.remove(contract);
    }
}
