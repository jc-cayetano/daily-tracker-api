import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectMember } from '../projects/entities/project-member.entity';
import { TimeLog } from '../time-logs/entities/time-log.entity';
import { DailySummaryController } from './daily-summary.controller';
import { DailySummaryService } from './daily-summary.service';

@Module({
  imports: [TypeOrmModule.forFeature([TimeLog, ProjectMember])],
  controllers: [DailySummaryController],
  providers: [DailySummaryService],
})
export class DailySummaryModule {}
