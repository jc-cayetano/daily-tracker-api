import { User } from '../../auth/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Project } from './project.entity';

export enum ProjectRole {
  PM = 'pm',
  MEMBER = 'member',
}

@Entity('project_members')
@Unique(['user', 'project'])
export class ProjectMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  project: Project;

  @Column({ type: 'enum', enum: ProjectRole })
  role: ProjectRole;

  @CreateDateColumn()
  joinedAt: Date;
}
