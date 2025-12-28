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
import { EvaluationCycle } from './evaluation-cycle.entity';
import { EvaluationCategory } from './performance-evaluation.entity';

@Entity('evaluation_templates')
export class EvaluationTemplate {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    // دسته‌بندی‌ها و سوالات با امتیازها
    @Column({ type: 'json' })
    categories: EvaluationCategory[];

    // ایجادکننده تمپلیت
    @Column({ nullable: true })
    createdById?: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'createdById' })
    createdBy?: User;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relations
    @OneToMany(() => EvaluationCycle, (cycle) => cycle.template)
    cycles: EvaluationCycle[];
}

