import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../tasks/entities/task.entity';
import { TimeLog } from '../time-logs/entities/time-log.entity';
import { LeaveRequest } from './entities/leave-request.entity';
import { Project } from './entities/project.entity';
import { ProjectMember } from './entities/project-member.entity';
import { ProjectDashboardController } from './project-dashboard.controller';
import { ProjectDashboardService } from './project-dashboard.service';
import { ProjectMembersController } from './project-members.controller';
import { ProjectMembersService } from './project-members.service';
import { ProjectTasksController } from './project-tasks.controller';
import { ProjectTasksService } from './project-tasks.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      ProjectMember,
      LeaveRequest,
      Task,
      TimeLog,
    ]),
  ],
  controllers: [
    ProjectsController,
    ProjectMembersController,
    ProjectTasksController,
    ProjectDashboardController,
  ],
  providers: [
    ProjectsService,
    ProjectMembersService,
    ProjectTasksService,
    ProjectDashboardService,
  ],
  exports: [ProjectsService, ProjectMembersService],
})
export class ProjectsModule {}
