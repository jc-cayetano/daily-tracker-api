import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task, TaskStatus } from './entities/task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const existing = await this.taskRepository.findOne({
      where: { name: createTaskDto.name, user: { id: userId } },
    });

    if (existing) {
      throw new ConflictException('Task with this name already exists');
    }

    const task = this.taskRepository.create({
      ...createTaskDto,
      user: { id: userId },
    });

    return this.taskRepository.save(task);
  }

  async findAll(userId: string, status?: TaskStatus): Promise<Task[]> {
    const where: any = { user: { id: userId } };
    if (status) where.status = status;

    return this.taskRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async archive(id: string, userId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!task) throw new NotFoundException('Task not found');

    task.status = TaskStatus.ARCHIVED;
    return this.taskRepository.save(task);
  }

  async restore(id: string, userId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!task) throw new NotFoundException('Task not found');

    if (task.status === TaskStatus.ACTIVE) {
      throw new BadRequestException('Task is already active');
    }

    task.status = TaskStatus.ACTIVE;
    return this.taskRepository.save(task);
  }
}
