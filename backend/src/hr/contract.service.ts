import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract, ContractStatus } from './entities/contract.entity';
import { CreateContractDto } from './dto/create-contract.dto';

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

    async findAll(): Promise<Contract[]> {
        return this.contractRepository.find({ relations: ['user', 'assignments'] });
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
