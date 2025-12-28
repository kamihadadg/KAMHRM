import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { User } from '../../survey/entities/user.entity';

export enum EvaluationType {
    SELF = 'SELF',           // ارزیابی خود
    MANAGER = 'MANAGER',     // ارزیابی توسط مدیر
    PEER = 'PEER',          // ارزیابی توسط همکار
    SUBORDINATE = 'SUBORDINATE', // ارزیابی توسط زیردست
    CLIENT = 'CLIENT',       // ارزیابی توسط مشتری
}

export enum EvaluationStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    REVIEWED = 'REVIEWED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export class EvaluationCategory {
    @Column()
    name: string; // نام دسته (کیفیت کار، همکاری، رهبری و غیره)

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.0 })
    weight: number; // وزن دسته در امتیاز نهایی

    @Column({ type: 'json' })
    criteria: EvaluationCriterion[]; // معیارهای ارزیابی در این دسته
}

export class EvaluationCriterion {
    @Column()
    title: string; // عنوان معیار

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
    rating?: number; // امتیاز 1-5

    @Column({ type: 'text', nullable: true })
    comments?: string; // نظر ارزیاب
}

@Entity('performance_evaluations')
export class PerformanceEvaluation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // ارزیابی شونده
    @Column()
    employeeId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'employeeId' })
    employee: User;

    // ارزیاب
    @Column()
    evaluatorId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'evaluatorId' })
    evaluator: User;

    // نوع ارزیابی
    @Column({
        type: 'varchar',
        length: 20,
        default: EvaluationType.SELF,
    })
    evaluationType: EvaluationType;

    // دوره ارزیابی
    @Column()
    period: string; // مثلاً '2024-Q1', '2024-Annual', '2024-Monthly'

    @Column({ type: 'date' })
    startDate: Date;

    @Column({ type: 'date' })
    endDate: Date;

    // دسته‌بندی‌های ارزیابی
    @Column({ type: 'json' })
    categories: EvaluationCategory[];

    // امتیاز نهایی
    @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
    overallRating?: number;

    // نظر کلی ارزیاب
    @Column({ type: 'text', nullable: true })
    overallComments?: string;

    // نقاط قوت
    @Column({ type: 'text', nullable: true })
    strengths?: string;

    // نقاط ضعف
    @Column({ type: 'text', nullable: true })
    weaknesses?: string;

    // اهداف بهبود
    @Column({ type: 'text', nullable: true })
    improvementGoals?: string;

    // وضعیت ارزیابی
    @Column({
        type: 'varchar',
        length: 20,
        default: EvaluationStatus.DRAFT,
    })
    status: EvaluationStatus;

    // تاریخ ارسال ارزیابی
    @Column({ type: 'timestamp', nullable: true })
    submittedAt?: Date;

    // تاریخ بررسی توسط مدیر
    @Column({ type: 'timestamp', nullable: true })
    reviewedAt?: Date;

    // نظر مدیر
    @Column({ type: 'text', nullable: true })
    managerComments?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
