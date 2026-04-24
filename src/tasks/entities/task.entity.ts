import { User } from '../../auth/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

export enum TaskStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

@Entity('tasks')
@Unique(['name', 'user'])
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.ACTIVE })
  status: TaskStatus;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  assignee: User | null;

  @ManyToOne(() => Project, { nullable: true, onDelete: 'CASCADE' })
  project: Project | null;

  @CreateDateColumn()
  createdAt: Date;
}
