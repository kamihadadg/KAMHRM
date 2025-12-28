import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Position } from './position.entity';
import { Contract } from '../../hr/entities/contract.entity';

export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  HR = 'HR',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  employeeId: string; // کد پرسنلی

  @Column({ unique: true, nullable: true })
  username?: string; // نام کاربری برای ورود

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  password: string; // هش شده

  @Column({ nullable: true })
  positionId: string; // سمت سازمانی


  @Column({ nullable: true })
  managerId: string; // مدیر مستقیم

  @Column({
    type: 'nvarchar',
    length: 50,
    default: UserRole.EMPLOYEE,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true })
  profileImageUrl: string; // URL عکس پروفایل

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'managerId' })
  manager: User;

  @OneToMany(() => User, 'manager')
  subordinates: User[];

  @OneToMany(() => Contract, (contract) => contract.user)
  contracts: Contract[];

  // Computed properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
