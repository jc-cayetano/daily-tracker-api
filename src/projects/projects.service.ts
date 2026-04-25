import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventPublisherService } from '../events/event-publisher.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { Project, ProjectStatus } from './entities/project.entity';
import { ProjectMember, ProjectRole } from './entities/project-member.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly memberRepository: Repository<ProjectMember>,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  async create(dto: CreateProjectDto, userId: string) {
    const project = await this.projectRepository.save(
      this.projectRepository.create({
        ...dto,
        owner: { id: userId },
      }),
    );

    await this.memberRepository.save(
      this.memberRepository.create({
        user: { id: userId },
        project: { id: project.id },
        role: ProjectRole.PM,
      }),
    );

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      ownerId: userId,
      createdAt: project.createdAt,
    };
  }

  async findAll(userId: string) {
    const memberships = await this.memberRepository.find({
      where: { user: { id: userId } },
      relations: ['project'],
    });

    const results: any[] = [];
    for (const m of memberships) {
      const memberCount = await this.memberRepository.count({
        where: { project: { id: m.project.id } },
      });
      results.push({
        id: m.project.id,
        name: m.project.name,
        status: m.project.status,
        role: m.role,
        memberCount,
        createdAt: m.project.createdAt,
      });
    }

    return results;
  }

  async findOne(id: string, userId: string) {
    await this.validateMembership(id, userId);

    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!project) throw new NotFoundException('Project not found');

    const members = await this.memberRepository.find({
      where: { project: { id } },
      relations: ['user'],
    });

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      ownerId: project.owner.id,
      members: members.map((m) => ({
        id: m.id,
        userId: m.user.id,
        username: m.user.username,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
      createdAt: project.createdAt,
    };
  }

  async close(id: string, userId: string) {
    const project = await this.findProjectAsPm(id, userId);
    project.status = ProjectStatus.CLOSED;
    await this.projectRepository.save(project);

    this.eventPublisher.publishToProject(id, 'project:status-changed', {
      projectId: id,
      status: 'closed',
    });

    return { id: project.id, status: project.status };
  }

  async reopen(id: string, userId: string) {
    const project = await this.findProjectAsPm(id, userId);
    project.status = ProjectStatus.OPEN;
    await this.projectRepository.save(project);

    this.eventPublisher.publishToProject(id, 'project:status-changed', {
      projectId: id,
      status: 'open',
    });

    return { id: project.id, status: project.status };
  }

  private async findProjectAsPm(
    projectId: string,
    userId: string,
  ): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) throw new NotFoundException('Project not found');

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

    return project;
  }

  private async validateMembership(
    projectId: string,
    userId: string,
  ): Promise<ProjectMember> {
    const membership = await this.memberRepository.findOne({
      where: {
        project: { id: projectId },
        user: { id: userId },
      },
    });

    if (!membership) {
      throw new NotFoundException('Project not found');
    }

    return membership;
  }
}
