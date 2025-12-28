import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../survey/entities/user.entity';

export enum GoalCategory {
    INDIVIDUAL = 'INDIVIDUAL',     // هدف فردی
    TEAM = 'TEAM',                 // هدف تیمی
    DEPARTMENTAL = 'DEPARTMENTAL', // هدف دپارتمانی
    ORGANIZATIONAL = 'ORGANIZATIONAL', // هدف سازمانی
}

export enum GoalStatus {
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    OVERDUE = 'OVERDUE',
    CANCELLED = 'CANCELLED',
}

export enum GoalPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL',
}

@Entity('performance_goals')
export class PerformanceGoal {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // مالک هدف
    @Column()
    employeeId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'employeeId' })
    employee: User;

    // تنظیم‌کننده هدف (معمولاً مدیر)
    @Column({ nullable: true })
    setterId?: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'setterId' })
    setter?: User;

    // اطلاعات هدف
    @Column()
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({
        type: 'varchar',
        length: 20,
        default: GoalCategory.INDIVIDUAL,
    })
    category: GoalCategory;

    @Column({
        type: 'varchar',
        length: 20,
        default: GoalPriority.MEDIUM,
    })
    priority: GoalPriority;

    // اندازه‌گیری هدف
    @Column({ type: 'text', nullable: true })
    measurementCriteria?: string; // چگونه اندازه‌گیری می‌شود

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    targetValue?: number; // مقدار هدف

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    currentValue?: number; // مقدار فعلی

    @Column({ nullable: true })
    unit?: string; // واحد اندازه‌گیری (ریال، درصد، عدد و غیره)

    // زمان‌بندی
    @Column({ type: 'timestamp' })
    deadline: Date;

    // پیشرفت
    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    progress: number; // درصد پیشرفت (0-100)

    // وضعیت
    @Column({
        type: 'varchar',
        length: 20,
        default: GoalStatus.ACTIVE,
    })
    status: GoalStatus;

    // تاریخ تکمیل
    @Column({ type: 'timestamp', nullable: true })
    completedAt?: Date;

    // نظرات و بازخوردها
    @Column({ type: 'text', nullable: true })
    comments?: string;

    // اهداف مرتبط (اگر این هدف زیرمجموعه هدف دیگری باشد)
    @Column({ nullable: true })
    parentGoalId?: string;

    @ManyToOne(() => PerformanceGoal, { nullable: true })
    @JoinColumn({ name: 'parentGoalId' })
    parentGoal?: PerformanceGoal;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
