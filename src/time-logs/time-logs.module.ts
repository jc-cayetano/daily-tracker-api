import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../projects/entities/project.entity';
import { User } from '../auth/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { TimeLog } from './entities/time-log.entity';
import { TimeLogsController } from './time-logs.controller';
import { TimeLogsService } from './time-logs.service';

@Module({
  imports: [TypeOrmModule.forFeature([TimeLog, Task, Project, User])],
  controllers: [TimeLogsController],
  providers: [TimeLogsService],
  exports: [TimeLogsService],
})
export class TimeLogsModule {}
