import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { ProjectMember, ProjectRole } from './entities/project-member.entity';
import {
  LeaveRequest,
  LeaveRequestStatus,
} from './entities/leave-request.entity';

@Injectable()
export class ProjectMembersService {
  constructor(
    @InjectRepository(ProjectMember)
    private readonly memberRepository: Repository<ProjectMember>,
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepository: Repository<LeaveRequest>,
  ) {}

  async addMember(projectId: string, dto: AddMemberDto, userId: string) {
    await this.requirePm(projectId, userId);

    const existing = await this.memberRepository.findOne({
      where: { project: { id: projectId }, user: { id: dto.userId } },
    });

    if (existing) {
      throw new ConflictException('User is already a member of this project');
    }

    const member = await this.memberRepository.save(
      this.memberRepository.create({
        user: { id: dto.userId },
        project: { id: projectId },
        role: ProjectRole.MEMBER,
      }),
    );

    return {
      id: member.id,
      userId: dto.userId,
      role: member.role,
      joinedAt: member.joinedAt,
    };
  }

  async removeMember(projectId: string, targetUserId: string, userId: string) {
    await this.requirePm(projectId, userId);

    const member = await this.memberRepository.findOne({
      where: { project: { id: projectId }, user: { id: targetUserId } },
    });

    if (!member) throw new NotFoundException('Member not found');

    if (member.role === ProjectRole.PM) {
      throw new ForbiddenException('Cannot remove the PM from the project');
    }

    await this.memberRepository.remove(member);
  }

  async listMembers(projectId: string, userId: string) {
    await this.requireMembership(projectId, userId);

    const members = await this.memberRepository.find({
      where: { project: { id: projectId } },
      relations: ['user'],
      order: { joinedAt: 'ASC' },
    });

    return members.map((m) => ({
      id: m.id,
      userId: m.user.id,
      username: m.user.username,
      role: m.role,
      joinedAt: m.joinedAt,
    }));
  }

  async createLeaveRequest(projectId: string, userId: string) {
    const membership = await this.requireMembership(projectId, userId);

    if (membership.role === ProjectRole.PM) {
      throw new ForbiddenException('PM cannot request to leave their project');
    }

    const pending = await this.leaveRequestRepository.findOne({
      where: {
        project: { id: projectId },
        user: { id: userId },
        status: LeaveRequestStatus.PENDING,
      },
    });

    if (pending) {
      throw new ConflictException('A pending leave request already exists');
    }

    const request = await this.leaveRequestRepository.save(
      this.leaveRequestRepository.create({
        project: { id: projectId },
        user: { id: userId },
      }),
    );

    return {
      id: request.id,
      projectId,
      userId,
      status: request.status,
      createdAt: request.createdAt,
    };
  }

  async listLeaveRequests(projectId: string, userId: string) {
    await this.requirePm(projectId, userId);

    const requests = await this.leaveRequestRepository.find({
      where: {
        project: { id: projectId },
        status: LeaveRequestStatus.PENDING,
      },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });

    return requests.map((r) => ({
      id: r.id,
      userId: r.user.id,
      username: r.user.username,
      status: r.status,
      createdAt: r.createdAt,
    }));
  }

  async updateLeaveRequest(
    projectId: string,
    requestId: string,
    dto: UpdateLeaveRequestDto,
    userId: string,
  ) {
    await this.requirePm(projectId, userId);

    const request = await this.leaveRequestRepository.findOne({
      where: { id: requestId, project: { id: projectId } },
    });

    if (!request) throw new NotFoundException('Leave request not found');

    request.status = dto.status as unknown as LeaveRequestStatus;
    await this.leaveRequestRepository.save(request);

    if (dto.status === 'approved') {
      const member = await this.memberRepository.findOne({
        where: {
          project: { id: projectId },
          user: { id: request.user?.id },
        },
        relations: ['user'],
      });

      if (!member) {
        const reqWithUser = await this.leaveRequestRepository.findOne({
          where: { id: requestId },
          relations: ['user'],
        });
        if (reqWithUser) {
          const memberToRemove = await this.memberRepository.findOne({
            where: {
              project: { id: projectId },
              user: { id: reqWithUser.user.id },
            },
          });
          if (memberToRemove) {
            await this.memberRepository.remove(memberToRemove);
          }
        }
      } else {
        await this.memberRepository.remove(member);
      }
    }

    return { id: request.id, status: request.status };
  }

  private async requirePm(
    projectId: string,
    userId: string,
  ): Promise<ProjectMember> {
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

  private async requireMembership(
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
