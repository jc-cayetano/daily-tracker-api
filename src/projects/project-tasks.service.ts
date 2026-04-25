import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Task, TaskStatus } from '../tasks/entities/task.entity';
import { TimeLog, TimeLogStatus } from '../time-logs/entities/time-log.entity';
import { AssignTaskDto } from './dto/assign-task.dto';
import { CreateProjectTaskDto } from './dto/create-project-task.dto';
import { ProjectMember, ProjectRole } from './entities/project-member.entity';
import { Project, ProjectStatus } from './entities/project.entity';

@Injectable()
export class ProjectTasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly memberRepository: Repository<ProjectMember>,
    @InjectRepository(TimeLog)
    private readonly timeLogRepository: Repository<TimeLog>,
  ) {}

  async create(projectId: string, dto: CreateProjectTaskDto, userId: string) {
    const { project, membership } = await this.validateAccess(
      projectId,
      userId,
    );

    if (project.status === ProjectStatus.CLOSED) {
      throw new BadRequestException('Cannot create tasks in a closed project');
    }

    const assigneeId = dto.assigneeId || userId;

    if (membership.role !== ProjectRole.PM && assigneeId !== userId) {
      throw new ForbiddenException(
        'Members can only assign tasks to themselves',
      );
    }

    if (dto.assigneeId) {
      await this.validateMember(projectId, dto.assigneeId);
    }

    const existing = await this.taskRepository.findOne({
      where: { name: dto.name, project: { id: projectId } },
    });

    if (existing) {
      throw new ConflictException(
        'Task with this name already exists in this project',
      );
    }

    const task = await this.taskRepository.save(
      this.taskRepository.create({
        name: dto.name,
        user: { id: userId },
        assignee: { id: assigneeId },
        project: { id: projectId },
      }),
    );

    return {
      id: task.id,
      name: task.name,
      assigneeId,
      status: task.status,
      projectId,
      createdAt: task.createdAt,
    };
  }

  async findAll(projectId: string, userId: string) {
    await this.validateAccess(projectId, userId);

    const tasks = await this.taskRepository.find({
      where: { project: { id: projectId } },
      relations: ['assignee'],
      order: { createdAt: 'DESC' },
    });

    const result: any[] = [];
    for (const task of tasks) {
      const sessionCount = await this.timeLogRepository.count({
        where: { task: { id: task.id }, status: TimeLogStatus.COMPLETED },
      });

      const activeLog = await this.timeLogRepository.findOne({
        where: {
          task: { id: task.id },
          status: In([TimeLogStatus.RUNNING, TimeLogStatus.PAUSED]),
        },
      });

      result.push({
        id: task.id,
        name: task.name,
        assignee: task.assignee
          ? { id: task.assignee.id, username: task.assignee.username }
          : null,
        status: task.status,
        isInProgress: !!activeLog,
        sessionCount,
      });
    }

    return result;
  }

  async assign(
    projectId: string,
    taskId: string,
    dto: AssignTaskDto,
    userId: string,
  ) {
    await this.requirePm(projectId, userId);

    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (project?.status === ProjectStatus.CLOSED) {
      throw new BadRequestException('Cannot modify tasks in a closed project');
    }

    await this.validateMember(projectId, dto.assigneeId);

    const task = await this.taskRepository.findOne({
      where: { id: taskId, project: { id: projectId } },
    });

    if (!task) throw new NotFoundException('Task not found');

    task.assignee = { id: dto.assigneeId } as any;
    await this.taskRepository.save(task);

    return { id: task.id, assigneeId: dto.assigneeId };
  }

  async archive(projectId: string, taskId: string, userId: string) {
    await this.validateAccess(projectId, userId);

    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (project?.status === ProjectStatus.CLOSED) {
      throw new BadRequestException('Cannot modify tasks in a closed project');
    }

    const task = await this.taskRepository.findOne({
      where: { id: taskId, project: { id: projectId } },
    });

    if (!task) throw new NotFoundException('Task not found');

    task.status = TaskStatus.ARCHIVED;
    await this.taskRepository.save(task);

    return { id: task.id, status: task.status };
  }

  private async validateAccess(projectId: string, userId: string) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) throw new NotFoundException('Project not found');

    const membership = await this.memberRepository.findOne({
      where: { project: { id: projectId }, user: { id: userId } },
    });

    if (!membership) throw new NotFoundException('Project not found');

    return { project, membership };
  }

  private async validateMember(projectId: string, userId: string) {
    const member = await this.memberRepository.findOne({
      where: { project: { id: projectId }, user: { id: userId } },
    });

    if (!member) {
      throw new BadRequestException('User is not a member of this project');
    }

    return member;
  }

  private async requirePm(projectId: string, userId: string) {
    const membership = await this.memberRepository.findOne({
      where: {
        project: { id: projectId },
        user: { id: userId },
        role: ProjectRole.PM,
      },
    });

    if (!membership) {
      throw new ForbiddenException('Only the PM can perform this action');
    }

    return membership;
  }
}
