import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { EventPublisherService } from '../events/event-publisher.service';
import { Task } from '../tasks/entities/task.entity';
import { Project, ProjectStatus } from '../projects/entities/project.entity';
import { CreateTimeLogDto } from './dto/create-time-log.dto';
import { UpdateTimeLogDto } from './dto/update-time-log.dto';
import { TimeLog, TimeLogStatus } from './entities/time-log.entity';

@Injectable()
export class TimeLogsService {
  constructor(
    @InjectRepository(TimeLog)
    private readonly timeLogRepository: Repository<TimeLog>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  async start(dto: CreateTimeLogDto, userId: string) {
    const active = await this.findActive(userId);
    if (active) {
      throw new ConflictException('An active session already exists');
    }

    const task = await this.taskRepository.findOne({
      where: { id: dto.taskId },
      relations: ['project'],
    });

    if (!task) throw new NotFoundException('Task not found');

    if (task.project) {
      if (task.project.status === ProjectStatus.CLOSED) {
        throw new BadRequestException(
          'Cannot start a timer on a task in a closed project',
        );
      }

      if (task.project.status === ProjectStatus.OPEN) {
        task.project.status = ProjectStatus.WORK_IN_PROGRESS;
        await this.projectRepository.save(task.project);
      }
    }

    const timeLog = this.timeLogRepository.create({
      task: { id: dto.taskId },
      user: { id: userId },
      startedAt: new Date(),
    });

    const saved = await this.timeLogRepository.save(timeLog);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    const eventData = {
      projectId: task.project?.id ?? null,
      taskId: dto.taskId,
      userId,
      username: user?.username ?? '',
    };

    if (task.project) {
      this.eventPublisher.publishToProject(
        task.project.id,
        'timer:started',
        eventData,
      );
      if (task.project.status === ProjectStatus.WORK_IN_PROGRESS) {
        this.eventPublisher.publishToProject(
          task.project.id,
          'project:status-changed',
          { projectId: task.project.id, status: 'work_in_progress' },
        );
      }
    } else {
      this.eventPublisher.publishToUser(userId, 'personal:timer:started', {
        taskId: dto.taskId,
        userId,
      });
    }

    return {
      id: saved.id,
      taskId: dto.taskId,
      startedAt: saved.startedAt,
      status: saved.status,
    };
  }

  async pause(id: string, userId: string): Promise<TimeLog> {
    const timeLog = await this.findOneOrFail(id, userId);

    if (timeLog.status !== TimeLogStatus.RUNNING) {
      throw new BadRequestException('Only a running session can be paused');
    }

    timeLog.status = TimeLogStatus.PAUSED;
    timeLog.pausedAt = new Date();
    const saved = await this.timeLogRepository.save(timeLog);

    await this.publishTimerEvent(id, userId, 'timer:paused');

    return saved;
  }

  async resume(id: string, userId: string): Promise<TimeLog> {
    const timeLog = await this.findOneOrFail(id, userId);

    if (timeLog.status !== TimeLogStatus.PAUSED) {
      throw new BadRequestException('Only a paused session can be resumed');
    }

    timeLog.status = TimeLogStatus.RUNNING;
    timeLog.resumedAt = new Date();
    const saved = await this.timeLogRepository.save(timeLog);

    await this.publishTimerEvent(id, userId, 'timer:resumed');

    return saved;
  }

  async stop(id: string, userId: string): Promise<TimeLog> {
    const timeLog = await this.findOneOrFail(id, userId);

    if (timeLog.status === TimeLogStatus.COMPLETED) {
      throw new BadRequestException('Session is already completed');
    }

    timeLog.status = TimeLogStatus.COMPLETED;
    timeLog.stoppedAt = new Date();
    timeLog.duration = Math.floor(
      (timeLog.stoppedAt.getTime() - timeLog.startedAt.getTime()) / 1000,
    );
    const saved = await this.timeLogRepository.save(timeLog);

    const fullLog = await this.timeLogRepository.findOne({
      where: { id },
      relations: ['task', 'task.project', 'user'],
    });

    if (fullLog?.task.project) {
      this.eventPublisher.publishToProject(
        fullLog.task.project.id,
        'timer:stopped',
        {
          projectId: fullLog.task.project.id,
          taskId: fullLog.task.id,
          userId,
          username: fullLog.user.username,
          duration: saved.duration,
        },
      );
    } else {
      this.eventPublisher.publishToUser(userId, 'personal:timer:stopped', {
        taskId: fullLog?.task.id ?? '',
        userId,
        duration: saved.duration,
      });
    }

    return saved;
  }

  async findActive(userId: string): Promise<TimeLog | null> {
    return this.timeLogRepository.findOne({
      where: {
        user: { id: userId },
        status: In([TimeLogStatus.RUNNING, TimeLogStatus.PAUSED]),
      },
      relations: ['task'],
    });
  }

  async updateDescription(
    id: string,
    dto: UpdateTimeLogDto,
    userId: string,
  ): Promise<TimeLog> {
    const timeLog = await this.findOneOrFail(id, userId);

    if (timeLog.status !== TimeLogStatus.COMPLETED) {
      throw new BadRequestException(
        'Only completed sessions can have descriptions',
      );
    }

    timeLog.description = dto.description;
    return this.timeLogRepository.save(timeLog);
  }

  private async findOneOrFail(id: string, userId: string): Promise<TimeLog> {
    const timeLog = await this.timeLogRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!timeLog) throw new NotFoundException('Time log not found');
    return timeLog;
  }

  private async publishTimerEvent(
    timeLogId: string,
    userId: string,
    eventType: string,
  ): Promise<void> {
    const fullLog = await this.timeLogRepository.findOne({
      where: { id: timeLogId },
      relations: ['task', 'task.project', 'user'],
    });

    if (!fullLog) return;

    if (fullLog.task.project) {
      this.eventPublisher.publishToProject(
        fullLog.task.project.id,
        eventType,
        {
          projectId: fullLog.task.project.id,
          taskId: fullLog.task.id,
          userId,
          username: fullLog.user.username,
        },
      );
    }
  }
}
