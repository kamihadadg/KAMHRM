import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Controller('hr/assignments')
export class AssignmentController {
    constructor(private readonly assignmentService: AssignmentService) { }

    @Post()
    create(@Body() createAssignmentDto: CreateAssignmentDto) {
        return this.assignmentService.create(createAssignmentDto);
    }

    @Get()
    findAll() {
        return this.assignmentService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.assignmentService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateAssignmentDto: UpdateAssignmentDto) {
        return this.assignmentService.update(id, updateAssignmentDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        await this.assignmentService.remove(id);
        return { message: 'Assignment deleted successfully' };
    }
}
