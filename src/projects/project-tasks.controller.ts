import {
  Body,
  Controller,
  Get,
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
import { AssignTaskDto } from './dto/assign-task.dto';
import { CreateProjectTaskDto } from './dto/create-project-task.dto';
import { ProjectTasksService } from './project-tasks.service';

@ApiTags('Project Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('projects/:projectId/tasks')
export class ProjectTasksController {
  constructor(private readonly projectTasksService: ProjectTasksService) {}

  @Post()
  @Permissions('task:create')
  @ApiOperation({ summary: 'Create a task in a project' })
  @ApiResponse({ status: 201, description: 'Task created' })
  @ApiResponse({ status: 400, description: 'Project is closed' })
  @ApiResponse({ status: 403, description: 'Members can only self-assign' })
  @ApiResponse({ status: 409, description: 'Duplicate task name' })
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateProjectTaskDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.projectTasksService.create(projectId, dto, req.user.id);
  }

  @Get()
  @Permissions('task:read')
  @ApiOperation({ summary: 'List project tasks' })
  @ApiResponse({ status: 200, description: 'List of tasks' })
  findAll(
    @Param('projectId') projectId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.projectTasksService.findAll(projectId, req.user.id);
  }

  @Patch(':taskId/assign')
  @Permissions('task:assign')
  @ApiOperation({ summary: 'Assign or reassign a task (PM only)' })
  @ApiResponse({ status: 200, description: 'Task assigned' })
  @ApiResponse({ status: 400, description: 'Project is closed' })
  @ApiResponse({ status: 403, description: 'Not a PM' })
  assign(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: AssignTaskDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.projectTasksService.assign(projectId, taskId, dto, req.user.id);
  }

  @Patch(':taskId/archive')
  @Permissions('task:archive')
  @ApiOperation({ summary: 'Archive a project task' })
  @ApiResponse({ status: 200, description: 'Task archived' })
  @ApiResponse({ status: 400, description: 'Project is closed' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  archive(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.projectTasksService.archive(projectId, taskId, req.user.id);
  }
}
