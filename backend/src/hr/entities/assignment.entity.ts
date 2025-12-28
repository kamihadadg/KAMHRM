import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Contract } from './contract.entity';
import { Position } from '../../survey/entities/position.entity';

@Entity('assignments')
export class Assignment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    contractId: string;

    @Column()
    positionId: string;

    @Column({ type: 'date' })
    startDate: Date;

    @Column({ type: 'date', nullable: true })
    endDate: Date;

    @Column({ type: 'float', default: 100.0 })
    workloadPercentage: number;

    @Column({ default: false })
    isPrimary: boolean;

    @Column({ type: 'nvarchar', length: 1000, nullable: true })
    customJobDescription: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relations
    @ManyToOne(() => Contract, (contract) => contract.assignments)
    @JoinColumn({ name: 'contractId' })
    contract: Contract;

    @ManyToOne(() => Position, (position) => position.assignments)
    @JoinColumn({ name: 'positionId' })
    position: Position;
}
