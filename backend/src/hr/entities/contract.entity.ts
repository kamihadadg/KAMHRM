import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { User } from '../../survey/entities/user.entity';
import { Assignment } from './assignment.entity';

export enum ContractStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    TERMINATED = 'TERMINATED',
    EXPIRED = 'EXPIRED',
}

export enum ContractType {
    FULL_TIME = 'FULL_TIME',
    PART_TIME = 'PART_TIME',
    CONTRACTOR = 'CONTRACTOR',
    HOURLY = 'HOURLY',
}

@Entity('contracts')
export class Contract {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column({ type: 'date' })
    startDate: Date;

    @Column({ type: 'date', nullable: true })
    endDate: Date;

    @Column({
        type: 'nvarchar',
        length: 20,
        default: ContractStatus.DRAFT,
    })
    status: ContractStatus;

    @Column({
        type: 'nvarchar',
        length: 20,
        default: ContractType.FULL_TIME,
    })
    contractType: ContractType;

    @Column({ nullable: true })
    fileUrl: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relations
    @ManyToOne(() => User, (user) => user.contracts)
    @JoinColumn({ name: 'userId' })
    user: User;

    @OneToMany(() => Assignment, (assignment) => assignment.contract)
    assignments: Assignment[];
}
