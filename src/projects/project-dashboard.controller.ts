import {
  Controller,
  Get,
  Param,
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
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { ProjectDashboardService } from './project-dashboard.service';

@ApiTags('Project Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('projects/:projectId/dashboard')
export class ProjectDashboardController {
  constructor(
    private readonly projectDashboardService: ProjectDashboardService,
  ) {}

  @Get()
  @Permissions('dashboard:read')
  @ApiOperation({ summary: 'Get PM project monitoring dashboard' })
  @ApiQuery({ name: 'from', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'to', required: false, description: 'YYYY-MM-DD' })
  @ApiResponse({ status: 200, description: 'Dashboard data' })
  @ApiResponse({ status: 403, description: 'Not a PM' })
  getDashboard(
    @Param('projectId') projectId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.projectDashboardService.getDashboard(
      projectId,
      req.user.id,
      from,
      to,
    );
  }
}
