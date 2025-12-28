import { Controller, Get, Post, Body, Param, Patch, Put, Delete, Query } from '@nestjs/common';
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { ContractStatus } from './entities/contract.entity';
import type { PaginationQuery } from '../shared/interfaces/pagination.interface';

@Controller('hr/contracts')
export class ContractController {
    constructor(private readonly contractService: ContractService) { }

    @Post()
    create(@Body() createContractDto: CreateContractDto) {
        return this.contractService.create(createContractDto);
    }

    @Get()
    findAll(@Query() query: PaginationQuery) {
        return this.contractService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.contractService.findOne(id);
    }

    @Patch(':id/status')
    async updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.contractService.updateStatus(id, status as any);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateData: any) {
        return this.contractService.update(id, updateData);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        await this.contractService.remove(id);
        return { message: 'Contract deleted successfully' };
    }
}
