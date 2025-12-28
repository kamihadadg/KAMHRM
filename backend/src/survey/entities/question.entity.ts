import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Survey } from './survey.entity';
import { Response } from './response.entity';

export enum QuestionType {
  TEXT = 'text',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  SELECT = 'select',
}

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'varchar', length: 50, default: QuestionType.TEXT })
  type: QuestionType;

  @Column({ type: 'text', nullable: true })
  options: string; // JSON string for radio/checkbox/select options

  @Column({ default: false })
  isRequired: boolean;

  @Column({ default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Survey, (survey) => survey.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'surveyId' })
  survey: Survey;

  @Column()
  surveyId: string;

  @OneToMany(() => Response, (response) => response.question)
  responses: Response[];
}
