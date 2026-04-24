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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsService } from './projects.service';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created' })
  create(@Body() dto: CreateProjectDto, @Request() req: any) {
    return this.projectsService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: "List user's projects" })
  @ApiResponse({ status: 200, description: 'List of projects' })
  findAll(@Request() req: any) {
    return this.projectsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project details' })
  @ApiResponse({ status: 200, description: 'Project details' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.projectsService.findOne(id, req.user.id);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Close a project (PM only)' })
  @ApiResponse({ status: 200, description: 'Project closed' })
  @ApiResponse({ status: 403, description: 'Not a PM' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  close(@Param('id') id: string, @Request() req: any) {
    return this.projectsService.close(id, req.user.id);
  }

  @Patch(':id/reopen')
  @ApiOperation({ summary: 'Reopen a closed project (PM only)' })
  @ApiResponse({ status: 200, description: 'Project reopened' })
  @ApiResponse({ status: 403, description: 'Not a PM' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  reopen(@Param('id') id: string, @Request() req: any) {
    return this.projectsService.reopen(id, req.user.id);
  }
}
