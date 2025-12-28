import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
    OneToMany,
    JoinColumnOptions,
} from 'typeorm';
import { User } from '../../survey/entities/user.entity';

export class Address {
    @Column({ nullable: true })
    province?: string;

    @Column({ nullable: true })
    city?: string;

    @Column({ nullable: true })
    street?: string;

    @Column({ nullable: true })
    postalCode?: string;

    @Column({ type: 'text', nullable: true })
    fullAddress?: string;
}

export class EmergencyContact {
    @Column()
    name: string;

    @Column()
    relationship: string;

    @Column()
    phone: string;
}

export class Education {
    @Column()
    level: string; // 'HIGH_SCHOOL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'PHD'

    @Column({ nullable: true })
    field?: string;

    @Column({ nullable: true })
    university?: string;

    @Column({ nullable: true })
    graduationYear?: number;

    @Column({ type: 'float', nullable: true })
    gpa?: number;
}

export class PreviousJob {
    @Column()
    companyName: string;

    @Column()
    position: string;

    @Column({ type: 'date' })
    startDate: Date;

    @Column({ type: 'date', nullable: true })
    endDate?: Date;

    @Column({ type: 'text', nullable: true })
    responsibilities?: string;

    @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
    lastSalary?: number;
}

@Entity('employee_profiles')
export class EmployeeProfile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    // Relation to User
    @OneToOne(() => User, (user: User) => user.employeeProfile, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    // Personal Information
    @Column({ unique: true })
    nationalId: string;

    @Column({ type: 'date' })
    birthDate: Date;

    @Column()
    birthPlace: string;

    @Column()
    gender: 'MALE' | 'FEMALE';

    @Column()
    maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';

    @Column({ type: 'int', nullable: true })
    childrenCount?: number;

    @Column({ nullable: true })
    militaryStatus?: 'COMPLETED' | 'EXEMPTED' | 'NOT_COMPLETED';

    // Contact Information
    @Column()
    phoneNumber: string;

    @Column({ nullable: true })
    emergencyPhone?: string;

    @Column({ type: 'text', nullable: true })
    address?: string;

    @Column({ nullable: true })
    email?: string;

    // Employment Information
    @Column({ type: 'date' })
    hireDate: Date;

    @Column({ nullable: true })
    employeeId?: string; // شماره پرسنلی

    @Column({ nullable: true })
    department?: string;

    @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
    baseSalary?: number;

    @Column({ nullable: true })
    employmentType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';

    // Insurance and Tax Information
    @Column({ nullable: true })
    insuranceNumber?: string;

    @Column({ nullable: true })
    taxCode?: string;

    @Column({ nullable: true })
    bankAccountNumber?: string;

    @Column({ nullable: true })
    bankName?: string;

    // Education (stored as JSON string)
    @Column({ type: 'text', nullable: true })
    education?: string;

    // Previous Jobs (stored as JSON string)
    @Column({ type: 'text', nullable: true })
    previousJobs?: string;

    // Emergency Contacts (stored as JSON string)
    @Column({ type: 'text', nullable: true })
    emergencyContacts?: string;

    // Additional Information
    @Column({ type: 'text', nullable: true })
    skills?: string;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    // Profile Image
    @Column({ nullable: true })
    profileImageUrl?: string;

    // Status
    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
