import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectMember } from '../projects/entities/project-member.entity';
import {
  TimeLog,
  TimeLogStatus,
} from '../time-logs/entities/time-log.entity';

@Injectable()
export class DailySummaryService {
  constructor(
    @InjectRepository(TimeLog)
    private readonly timeLogRepository: Repository<TimeLog>,
    @InjectRepository(ProjectMember)
    private readonly memberRepository: Repository<ProjectMember>,
  ) {}

  async getSummary(date: string, userId: string) {
    const timeLogs = await this.timeLogRepository
      .createQueryBuilder('tl')
      .leftJoinAndSelect('tl.task', 'task')
      .leftJoinAndSelect('task.project', 'project')
      .where('tl.userId = :userId', { userId })
      .andWhere('tl.status = :status', { status: TimeLogStatus.COMPLETED })
      .andWhere('DATE(tl.startedAt) = :date', { date })
      .orderBy('tl.startedAt', 'ASC')
      .getMany();

    const projectCount = await this.memberRepository.count({
      where: { user: { id: userId } },
    });

    const projectMap = new Map<
      string | null,
      {
        id: string | null;
        name: string | null;
        totalHours: number;
        tasks: Map<string, { id: string; name: string; totalHours: number; sessions: any[] }>;
      }
    >();

    for (const log of timeLogs) {
      const projectId = log.task.project?.id ?? null;
      const projectName = log.task.project?.name ?? null;

      if (!projectMap.has(projectId)) {
        projectMap.set(projectId, {
          id: projectId,
          name: projectName,
          totalHours: 0,
          tasks: new Map(),
        });
      }

      const proj = projectMap.get(projectId)!;
      const taskId = log.task.id;

      if (!proj.tasks.has(taskId)) {
        proj.tasks.set(taskId, {
          id: taskId,
          name: log.task.name,
          totalHours: 0,
          sessions: [],
        });
      }

      const task = proj.tasks.get(taskId)!;
      const hours = (log.duration ?? 0) / 3600;
      task.totalHours = +(task.totalHours + hours).toFixed(2);
      task.sessions.push({
        id: log.id,
        startedAt: log.startedAt,
        stoppedAt: log.stoppedAt,
        duration: log.duration,
        description: log.description,
      });
    }

    const projects = Array.from(projectMap.values()).map((p) => {
      const tasks = Array.from(p.tasks.values());
      const totalHours = +tasks
        .reduce((sum, t) => sum + t.totalHours, 0)
        .toFixed(2);
      return {
        id: p.id,
        name: p.name,
        totalHours,
        tasks,
      };
    });

    const totalHours = +projects
      .reduce((sum, p) => sum + p.totalHours, 0)
      .toFixed(2);

    return { date, totalHours, projectCount, projects };
  }
}
