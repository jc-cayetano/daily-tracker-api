import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './entities/task.entity';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Permissions('task:create')
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created' })
  @ApiResponse({ status: 409, description: 'Duplicate task name' })
  create(@Body() createTaskDto: CreateTaskDto, @Request() req: any) {
    return this.tasksService.create(createTaskDto, req.user.id);
  }

  @Get()
  @Permissions('task:read')
  @ApiOperation({ summary: 'List tasks, optionally filtered by status' })
  @ApiQuery({ name: 'status', enum: TaskStatus, required: false })
  @ApiResponse({ status: 200, description: 'List of tasks' })
  findAll(@Query('status') status: TaskStatus, @Request() req: any) {
    return this.tasksService.findAll(req.user.id, status);
  }

  @Patch(':id/archive')
  @Permissions('task:archive')
  @ApiOperation({ summary: 'Archive a task' })
  @ApiResponse({ status: 200, description: 'Task archived' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  archive(@Param('id') id: string, @Request() req: any) {
    return this.tasksService.archive(id, req.user.id);
  }

  @Patch(':id/restore')
  @Permissions('task:restore')
  @ApiOperation({ summary: 'Restore an archived task' })
  @ApiResponse({ status: 200, description: 'Task restored' })
  @ApiResponse({ status: 400, description: 'Task is already active' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  restore(@Param('id') id: string, @Request() req: any) {
    return this.tasksService.restore(id, req.user.id);
  }
}
