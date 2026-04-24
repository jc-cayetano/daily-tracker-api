import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { TimeLog, TimeLogStatus } from '../time-logs/entities/time-log.entity';
import { ProjectMember, ProjectRole } from './entities/project-member.entity';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectDashboardService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly memberRepository: Repository<ProjectMember>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TimeLog)
    private readonly timeLogRepository: Repository<TimeLog>,
  ) {}

  async getDashboard(
    projectId: string,
    userId: string,
    from?: string,
    to?: string,
  ) {
    await this.requirePm(projectId, userId);

    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    const { startDate, endDate } = this.getDateRange(from, to);

    const members = await this.memberRepository.find({
      where: { project: { id: projectId } },
      relations: ['user'],
    });

    const memberData: any[] = [];

    for (const member of members) {
      const memberId = member.user.id;

      const tasks = await this.taskRepository.find({
        where: { project: { id: projectId }, assignee: { id: memberId } },
      });

      const activeLog = await this.timeLogRepository.findOne({
        where: {
          user: { id: memberId },
          task: { project: { id: projectId } },
          status: In([TimeLogStatus.RUNNING, TimeLogStatus.PAUSED]),
        },
      });

      const taskDetails: any[] = [];
      let memberTotalHours = 0;

      for (const task of tasks) {
        const sessions = await this.timeLogRepository.find({
          where: {
            task: { id: task.id },
            user: { id: memberId },
            status: TimeLogStatus.COMPLETED,
            startedAt: Between(startDate, endDate),
          },
          order: { startedAt: 'ASC' },
        });

        const taskActiveLog = await this.timeLogRepository.findOne({
          where: {
            task: { id: task.id },
            status: In([TimeLogStatus.RUNNING, TimeLogStatus.PAUSED]),
          },
        });

        const taskHours = sessions.reduce(
          (sum, s) => sum + (s.duration ?? 0) / 3600,
          0,
        );
        memberTotalHours += taskHours;

        taskDetails.push({
          id: task.id,
          name: task.name,
          isInProgress: !!taskActiveLog,
          totalHours: +taskHours.toFixed(2),
          sessions: sessions.map((s) => ({
            id: s.id,
            startedAt: s.startedAt,
            stoppedAt: s.stoppedAt,
            duration: s.duration,
            description: s.description,
          })),
        });
      }

      memberData.push({
        id: memberId,
        username: member.user.username,
        totalHours: +memberTotalHours.toFixed(2),
        taskCount: tasks.length,
        isActive: !!activeLog,
        tasks: taskDetails,
      });
    }

    return {
      project: {
        id: project!.id,
        name: project!.name,
        status: project!.status,
      },
      members: memberData,
    };
  }

  private getDateRange(from?: string, to?: string) {
    if (from && to) {
      return {
        startDate: new Date(`${from}T00:00:00.000Z`),
        endDate: new Date(`${to}T23:59:59.999Z`),
      };
    }

    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const monday = new Date(now);
    monday.setUTCDate(now.getUTCDate() - ((dayOfWeek + 6) % 7));
    monday.setUTCHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    sunday.setUTCHours(23, 59, 59, 999);

    return { startDate: monday, endDate: sunday };
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
      throw new ForbiddenException('Only the PM can access the dashboard');
    }
  }
}
