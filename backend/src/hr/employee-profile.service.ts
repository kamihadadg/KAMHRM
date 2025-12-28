import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeProfile } from './entities/employee-profile.entity';
import { User } from '../survey/entities/user.entity';
import { CreateEmployeeProfileDto } from './dto/create-employee-profile.dto';
import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';

@Injectable()
export class EmployeeProfileService {
    constructor(
        @InjectRepository(EmployeeProfile)
        private employeeProfileRepository: Repository<EmployeeProfile>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async create(createEmployeeProfileDto: CreateEmployeeProfileDto): Promise<EmployeeProfile> {
        console.log('[EmployeeProfileService] Creating employee profile:', createEmployeeProfileDto);

        // Check if user exists
        const user = await this.userRepository.findOne({
            where: { id: createEmployeeProfileDto.userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Check if employee profile already exists for this user
        const existingProfile = await this.employeeProfileRepository.findOne({
            where: { userId: createEmployeeProfileDto.userId },
        });

        if (existingProfile) {
            throw new ConflictException('Employee profile already exists for this user');
        }

        // Check if nationalId is unique
        const existingNationalId = await this.employeeProfileRepository.findOne({
            where: { nationalId: createEmployeeProfileDto.nationalId },
        });

        if (existingNationalId) {
            throw new ConflictException('National ID already exists');
        }

        const employeeProfile = this.employeeProfileRepository.create({
            ...createEmployeeProfileDto,
            hireDate: new Date(createEmployeeProfileDto.hireDate),
            birthDate: new Date(createEmployeeProfileDto.birthDate),
            // JSON fields are already strings from frontend
        });

        const savedProfile = await this.employeeProfileRepository.save(employeeProfile);

        console.log('[EmployeeProfileService] Employee profile created successfully:', savedProfile.id);

        return this.findOne(savedProfile.id);
    }

    async findAll(): Promise<EmployeeProfile[]> {
        return this.employeeProfileRepository.find({
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<EmployeeProfile> {
        const employeeProfile = await this.employeeProfileRepository.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!employeeProfile) {
            throw new NotFoundException(`Employee profile with ID ${id} not found`);
        }

        return employeeProfile;
    }

    async findByUserId(userId: string): Promise<EmployeeProfile> {
        const employeeProfile = await this.employeeProfileRepository.findOne({
            where: { userId },
            relations: ['user'],
        });

        if (!employeeProfile) {
            throw new NotFoundException(`Employee profile for user ${userId} not found`);
        }

        return employeeProfile;
    }

    async update(id: string, updateEmployeeProfileDto: UpdateEmployeeProfileDto): Promise<EmployeeProfile> {
        console.log('[EmployeeProfileService] Updating employee profile:', id);

        const employeeProfile = await this.findOne(id);

        // Check if nationalId is unique (if being updated)
        if (updateEmployeeProfileDto.nationalId && updateEmployeeProfileDto.nationalId !== employeeProfile.nationalId) {
            const existingNationalId = await this.employeeProfileRepository.findOne({
                where: { nationalId: updateEmployeeProfileDto.nationalId },
            });

            if (existingNationalId) {
                throw new ConflictException('National ID already exists');
            }
        }

        // Update fields
        Object.assign(employeeProfile, updateEmployeeProfileDto);

        // Convert date strings to Date objects if provided
        if (updateEmployeeProfileDto.hireDate) {
            employeeProfile.hireDate = new Date(updateEmployeeProfileDto.hireDate);
        }
        if (updateEmployeeProfileDto.birthDate) {
            employeeProfile.birthDate = new Date(updateEmployeeProfileDto.birthDate);
        }

        await this.employeeProfileRepository.save(employeeProfile);

        console.log('[EmployeeProfileService] Employee profile updated successfully:', id);

        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        const employeeProfile = await this.findOne(id);
        await this.employeeProfileRepository.remove(employeeProfile);

        console.log(`[EmployeeProfileService] Employee profile ${id} removed.`);
    }

    async findByDepartment(department: string): Promise<EmployeeProfile[]> {
        return this.employeeProfileRepository.find({
            where: { department },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }

    async findActiveEmployees(): Promise<EmployeeProfile[]> {
        return this.employeeProfileRepository.find({
            where: { isActive: true },
            relations: ['user'],
            order: { hireDate: 'ASC' },
        });
    }
}
