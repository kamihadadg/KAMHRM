import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { EmployeeProfileService } from './employee-profile.service';
import { CreateEmployeeProfileDto } from './dto/create-employee-profile.dto';
import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('hr/employee-profiles')
@UseGuards(JwtAuthGuard)
export class EmployeeProfileController {
    constructor(private readonly employeeProfileService: EmployeeProfileService) {}

    @Post()
    create(@Body() createEmployeeProfileDto: CreateEmployeeProfileDto) {
        return this.employeeProfileService.create(createEmployeeProfileDto);
    }

    @Get()
    findAll(@Query('department') department?: string, @Query('active') active?: string) {
        if (department) {
            return this.employeeProfileService.findByDepartment(department);
        }
        if (active === 'true') {
            return this.employeeProfileService.findActiveEmployees();
        }
        return this.employeeProfileService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.employeeProfileService.findOne(id);
    }

    @Get('user/:userId')
    findByUserId(@Param('userId') userId: string) {
        return this.employeeProfileService.findByUserId(userId);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateEmployeeProfileDto: UpdateEmployeeProfileDto) {
        return this.employeeProfileService.update(id, updateEmployeeProfileDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        await this.employeeProfileService.remove(id);
        return { message: 'Employee profile deleted successfully' };
    }
}
