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
import { Assignment } from '../../hr/entities/assignment.entity';


@Entity('positions')
export class Position {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string; // عنوان سمت (مثل: مدیر فروش، کارشناس مالی)


  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  parentPositionId?: string; // سمت بالادستی


  @Column({ default: 0 })
  order: number; // ترتیب نمایش در چارت

  @Column({ default: false })
  isAggregate: boolean; // آیا این سمت تجمیعی است؟ (امکان داشتن چند پرسنل)

  @Column({ type: 'float', nullable: true })
  x: number | null;

  @Column({ type: 'float', nullable: true })
  y: number | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', nullable: true })
  colorScheme?: number; // رنگ‌بندی نود در چارت سازمانی (شماره رنگ)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Position, { nullable: true })
  @JoinColumn({ name: 'parentPositionId' })
  parentPosition?: Position;

  @OneToMany(() => Position, 'parentPosition')
  childPositions: Position[];

  @OneToMany(() => Assignment, (assignment) => assignment.position)
  assignments: Assignment[];

  // Computed property for hierarchy level
  get hierarchyLevel(): number {
    let level = 0;
    let current = this.parentPosition;
    while (current) {
      level++;
      current = current.parentPosition;
    }
    return level;
  }
}
