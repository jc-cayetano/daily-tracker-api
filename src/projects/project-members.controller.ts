import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { ProjectMembersService } from './project-members.service';

@ApiTags('Project Members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('projects/:projectId')
export class ProjectMembersController {
  constructor(private readonly projectMembersService: ProjectMembersService) {}

  @Post('members')
  @Permissions('member:add')
  @ApiOperation({ summary: 'Add a member to the project (PM only)' })
  @ApiResponse({ status: 201, description: 'Member added' })
  @ApiResponse({ status: 403, description: 'Not a PM' })
  @ApiResponse({ status: 409, description: 'User is already a member' })
  addMember(
    @Param('projectId') projectId: string,
    @Body() dto: AddMemberDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.projectMembersService.addMember(projectId, dto, req.user.id);
  }

  @Delete('members/:userId')
  @Permissions('member:remove')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a member from the project (PM only)' })
  @ApiResponse({ status: 204, description: 'Member removed' })
  @ApiResponse({ status: 403, description: 'Not a PM or cannot remove PM' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  removeMember(
    @Param('projectId') projectId: string,
    @Param('userId') targetUserId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.projectMembersService.removeMember(
      projectId,
      targetUserId,
      req.user.id,
    );
  }

  @Get('members')
  @Permissions('member:list')
  @ApiOperation({ summary: 'List project members' })
  @ApiResponse({ status: 200, description: 'List of members' })
  listMembers(
    @Param('projectId') projectId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.projectMembersService.listMembers(projectId, req.user.id);
  }

  @Post('leave-requests')
  @Permissions('leave-request:create')
  @ApiOperation({ summary: 'Request to leave the project' })
  @ApiResponse({ status: 201, description: 'Leave request created' })
  @ApiResponse({ status: 403, description: 'PM cannot request to leave' })
  @ApiResponse({ status: 409, description: 'Pending request already exists' })
  createLeaveRequest(
    @Param('projectId') projectId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.projectMembersService.createLeaveRequest(
      projectId,
      req.user.id,
    );
  }

  @Get('leave-requests')
  @Permissions('leave-request:list')
  @ApiOperation({ summary: 'List pending leave requests (PM only)' })
  @ApiResponse({ status: 200, description: 'List of leave requests' })
  @ApiResponse({ status: 403, description: 'Not a PM' })
  listLeaveRequests(
    @Param('projectId') projectId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.projectMembersService.listLeaveRequests(projectId, req.user.id);
  }

  @Patch('leave-requests/:requestId')
  @Permissions('leave-request:manage')
  @ApiOperation({ summary: 'Approve or reject a leave request (PM only)' })
  @ApiResponse({ status: 200, description: 'Leave request updated' })
  @ApiResponse({ status: 403, description: 'Not a PM' })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  updateLeaveRequest(
    @Param('projectId') projectId: string,
    @Param('requestId') requestId: string,
    @Body() dto: UpdateLeaveRequestDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.projectMembersService.updateLeaveRequest(
      projectId,
      requestId,
      dto,
      req.user.id,
    );
  }
}
