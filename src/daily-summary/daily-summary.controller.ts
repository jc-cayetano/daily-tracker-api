import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
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
import { DailySummaryService } from './daily-summary.service';

@ApiTags('Daily Summary')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('daily-summary')
export class DailySummaryController {
  constructor(private readonly dailySummaryService: DailySummaryService) {}

  @Get()
  @Permissions('daily-summary:read')
  @ApiOperation({ summary: 'Get daily productivity summary' })
  @ApiQuery({ name: 'date', example: '2026-04-24', description: 'YYYY-MM-DD' })
  @ApiResponse({ status: 200, description: 'Daily summary returned' })
  getSummary(@Query('date') date: string, @Request() req: any) {
    return this.dailySummaryService.getSummary(date, req.user.id);
  }
}
