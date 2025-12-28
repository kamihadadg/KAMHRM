import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../survey/entities/user.entity';
import { Position } from '../survey/entities/position.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreatePositionDto } from './dto/create-position.dto';
import { PaginationQuery, PaginatedResponse } from '../shared/interfaces/pagination.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Position)
    private positionRepository: Repository<Position>,
    private jwtService: JwtService,
  ) { }

  async login(loginDto: LoginDto): Promise<{ access_token: string; user: any }> {
    const user = await this.userRepository.findOne({
      where: { username: loginDto.username },
      relations: ['manager'],
    });

    if (!user) {
      throw new UnauthorizedException('نام کاربری یا رمز عبور اشتباه است');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('حساب کاربری شما غیرفعال است');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است');
    }

    // Update last login
    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      employeeId: user.employeeId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        employeeId: user.employeeId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        manager: user.manager,
      },
    };
  }


  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('کاربر یافت نشد');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('رمز عبور فعلی اشتباه است');
    }

    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 12);

    await this.userRepository.update(userId, {
      password: hashedNewPassword,
      updatedAt: new Date(),
    });
  }

  async getProfile(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['manager', 'subordinates'],
    });

    if (!user) {
      throw new UnauthorizedException('کاربر یافت نشد');
    }

    return {
      id: user.id,
      employeeId: user.employeeId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      manager: user.manager,
      subordinates: user.subordinates,
      lastLoginAt: user.lastLoginAt,
    };
  }

  // Admin methods for user management
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // Check if username or employeeId already exists
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { employeeId: createUserDto.employeeId },
      ],
    });

    if (existingUser) {
      throw new ConflictException('کاربر با این نام کاربری یا کد پرسنلی قبلاً وجود دارد');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    // Create user object
    const userData: any = {
      employeeId: createUserDto.employeeId,
      username: createUserDto.username,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      password: hashedPassword,
      role: createUserDto.role,
      managerId: createUserDto.managerId || null,
    };

    // Remove empty strings
    if (userData.managerId === '') userData.managerId = null;

    const user = this.userRepository.create(userData as DeepPartial<User>);

    return this.userRepository.save(user);
  }

  async getAllUsers(query: PaginationQuery = {}): Promise<PaginatedResponse<User>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = query;

    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.manager', 'manager')
      .leftJoinAndSelect('user.subordinates', 'subordinates');

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(user.firstName LIKE :search OR user.lastName LIKE :search OR user.username LIKE :search OR user.employeeId LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply sorting
    queryBuilder.orderBy(`user.${sortBy}`, sortOrder);

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const users = await queryBuilder.getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
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

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['manager', 'subordinates'],
    });

    if (!user) {
      throw new BadRequestException('کاربر یافت نشد');
    }

    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.getUserById(id);

    // Check username uniqueness if being updated
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: updateUserDto.username },
      });
      if (existingUser) {
        throw new ConflictException('نام کاربری قبلاً استفاده شده است');
      }
    }

    const updateData: any = { ...updateUserDto };

    // Sanitize GUID fields
    if (updateData.managerId === '') updateData.managerId = null;

    await this.userRepository.update(id, updateData);
    return this.getUserById(id);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.getUserById(id);
    await this.userRepository.remove(user);
  }


  // Admin methods for position management
  async createPosition(createPositionDto: CreatePositionDto): Promise<Position> {
    // Check if position title already exists
    const existingPosition = await this.positionRepository.findOne({
      where: { title: createPositionDto.title },
    });

    if (existingPosition) {
      throw new ConflictException('سمت با این عنوان قبلاً وجود دارد');
    }

    // Handle empty parentPositionId - convert empty string to undefined
    const positionData = {
      ...createPositionDto,
      parentPositionId: createPositionDto.parentPositionId === '' ? undefined : createPositionDto.parentPositionId,
    };

    const position = this.positionRepository.create(positionData);
    return this.positionRepository.save(position);
  }

  async getAllPositions(query: PaginationQuery = {}): Promise<PaginatedResponse<Position>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'order',
      sortOrder = 'ASC'
    } = query;

    const queryBuilder = this.positionRepository.createQueryBuilder('position')
      .leftJoinAndSelect('position.parentPosition', 'parentPosition')
      .leftJoinAndSelect('position.childPositions', 'childPositions');

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(position.title LIKE :search OR position.description LIKE :search OR position.department LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply sorting
    queryBuilder.orderBy(`position.${sortBy}`, sortOrder);

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const positions = await queryBuilder.getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      data: positions,
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

  async getPositionById(id: string): Promise<Position> {
    const position = await this.positionRepository.findOne({
      where: { id },
      relations: ['childPositions'],
    });

    if (!position) {
      throw new BadRequestException('سمت یافت نشد');
    }

    return position;
  }

  async updatePosition(id: string, updateData: Partial<CreatePositionDto>): Promise<Position> {
    const position = await this.getPositionById(id);

    // Check title uniqueness if being updated
    if (updateData.title && updateData.title !== position.title) {
      const existingPosition = await this.positionRepository.findOne({
        where: { title: updateData.title },
      });
      if (existingPosition) {
        throw new ConflictException('سمت با این عنوان قبلاً وجود دارد');
      }
    }

    // Handle empty parentPositionId - convert empty string to undefined
    const updateDataWithNull = {
      ...updateData,
      parentPositionId: updateData.parentPositionId === '' ? undefined : updateData.parentPositionId,
    };

    await this.positionRepository.update(id, updateDataWithNull);
    return this.getPositionById(id);
  }

  async deletePosition(id: string): Promise<void> {
    const position = await this.getPositionById(id);

    // Position can be deleted - employees are managed via assignments
    await this.positionRepository.remove(position);
  }

  // Get organizational chart based on positions and active assignments
  async getOrganizationalChart(): Promise<any[]> {
    const positions = await this.positionRepository.find({
      relations: ['assignments', 'assignments.contract', 'assignments.contract.user'],
      where: { isActive: true },
      order: { order: 'ASC' },
    });

    // Filter out invalid positions
    const validPositions = positions.filter(pos => {
      if (!pos.id || typeof pos.id !== 'string' || pos.id.length !== 36) {
        console.error('Invalid position found in database for org chart:', pos);
        return false;
      }
      return true;
    });

    return this.buildOrgChart(validPositions);
  }

  private buildOrgChart(positions: Position[]): any[] {
    const positionMap = new Map<string, any>();

    // First pass: Create all position nodes with assignments
    positions.forEach(pos => {
      // Get active assignments for this position
      const activeAssignments = (pos.assignments || []).filter(assignment => {
        // Check if contract is active and assignment is not expired
        const isContractActive = assignment.contract?.status === 'ACTIVE';
        const isNotExpired = !assignment.endDate || new Date(assignment.endDate) > new Date();
        return isContractActive && isNotExpired && assignment.contract?.user;
      });

      // Map assignments to employee data with workload
      const employees = activeAssignments.map(assignment => ({
        id: assignment.contract.user.id,
        firstName: assignment.contract.user.firstName,
        lastName: assignment.contract.user.lastName,
        role: assignment.contract.user.role,
        employeeId: assignment.contract.user.employeeId,
        profileImageUrl: assignment.contract.user.profileImageUrl,
        workloadPercentage: assignment.workloadPercentage,
        isPrimary: assignment.isPrimary,
        assignmentId: assignment.id,
      }));

      positionMap.set(pos.id, {
        id: pos.id,
        title: pos.title,
        description: pos.description,
        isAggregate: pos.isAggregate,
        x: pos.x,
        y: pos.y,
        parentPositionId: pos.parentPositionId,
        colorScheme: pos.colorScheme,
        employees: employees,
        children: []
      });
    });

    const roots: any[] = [];

    // Second pass: Build the tree
    positionMap.forEach(node => {
      if (node.parentPositionId && positionMap.has(node.parentPositionId)) {
        positionMap.get(node.parentPositionId).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  async updatePositionOrder(positionId: string, parentPositionId: string | null): Promise<Position> {
    // Validate positionId is a valid GUID
    if (!positionId || typeof positionId !== 'string' || positionId.length !== 36) {
      throw new BadRequestException('شناسه سمت نامعتبر است');
    }

    // Validate parentPositionId if provided
    if (parentPositionId !== null && (typeof parentPositionId !== 'string' || parentPositionId.length !== 36)) {
      throw new BadRequestException('شناسه سمت والد نامعتبر است');
    }

    console.log(`Updating position ${positionId} parent to ${parentPositionId}`);

    try {
      const result = await this.positionRepository.createQueryBuilder()
        .update(Position)
        .set({ parentPositionId: parentPositionId as any })
        .where("id = :id", { id: positionId })
        .execute();

      console.log('Update result:', result);
    } catch (error) {
      console.error('Database update error:', error);
      throw error;
    }

    return this.getPositionById(positionId);
  }

  async updatePositionCoordinates(id: string, x: number | null, y: number | null): Promise<void> {
    await this.positionRepository.update(id, { x, y });
  }

  async resetAllPositionCoordinates(): Promise<void> {
    // Reset all position coordinates to null to use auto-layout
    await this.positionRepository
      .createQueryBuilder()
      .update()
      .set({ x: null, y: null })
      .execute();
  }

  async getAllPositionsFlat(): Promise<Position[]> {
    const positions = await this.positionRepository.find({
      select: ['id', 'title', 'description', 'parentPositionId', 'order', 'isActive'],
      where: { isActive: true },
      order: { order: 'ASC' },
    });

    // Filter out invalid positions
    const validPositions = positions.filter(pos => {
      if (!pos.id || typeof pos.id !== 'string' || pos.id.length !== 36) {
        console.error('Invalid position found in database:', pos);
        return false;
      }
      return true;
    });

    return validPositions;
  }
}
