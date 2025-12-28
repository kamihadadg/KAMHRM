import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Question } from './question.entity';

@Entity('responses')
export class Response {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  answer: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string | null;

  @CreateDateColumn()
  submittedAt: Date;

  @Column({ default: true })
  isAnonymous: boolean;

  @Column({ type: 'varchar', length: 128, nullable: true })
  userId?: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  username?: string | null;

  @ManyToOne(() => Question, (question) => question.responses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'questionId' })
  question: Question;

  @Column()
  questionId: string;
}
