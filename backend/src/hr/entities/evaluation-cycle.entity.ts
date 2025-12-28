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
import { EvaluationTemplate } from './evaluation-template.entity';
import { PerformanceEvaluation } from './performance-evaluation.entity';
import { EvaluationType } from './performance-evaluation.entity';

export enum CycleStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    CLOSED = 'CLOSED',
}

@Entity('evaluation_cycles')
export class EvaluationCycle {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    // ارجاع به تمپلیت
    @Column()
    templateId: string;

    @ManyToOne(() => EvaluationTemplate, (template) => template.cycles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'templateId' })
    template: EvaluationTemplate;

    // تاریخ‌های دوره
    @Column({ type: 'date' })
    startDate: Date;

    @Column({ type: 'date' })
    endDate: Date;

    @Column({ type: 'date', nullable: true })
    submissionDeadline?: Date;

    // انواع نشر (SELF, MANAGER, SUBORDINATE, PEER)
    @Column({ type: 'json' })
    evaluationTypes: EvaluationType[];

    // وضعیت دوره
    @Column({
        type: 'varchar',
        length: 20,
        default: CycleStatus.DRAFT,
    })
    status: CycleStatus;

    // اطلاعات انتشار
    @Column({ type: 'timestamp', nullable: true })
    publishedAt?: Date;

    @Column({ nullable: true })
    publishedById?: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'publishedById' })
    publishedBy?: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relations
    @OneToMany(() => PerformanceEvaluation, (evaluation) => evaluation.cycle)
    evaluations: PerformanceEvaluation[];
}

