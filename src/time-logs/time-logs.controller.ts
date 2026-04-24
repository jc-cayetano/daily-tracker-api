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
import { CreateTimeLogDto } from './dto/create-time-log.dto';
import { UpdateTimeLogDto } from './dto/update-time-log.dto';
import { TimeLogsService } from './time-logs.service';

@ApiTags('Time Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('time-logs')
export class TimeLogsController {
  constructor(private readonly timeLogsService: TimeLogsService) {}

  @Post()
  @ApiOperation({ summary: 'Start a new time log session' })
  @ApiResponse({ status: 201, description: 'Session started' })
  @ApiResponse({ status: 409, description: 'Active session already exists' })
  start(@Body() dto: CreateTimeLogDto, @Request() req: any) {
    return this.timeLogsService.start(dto, req.user.id);
  }

  @Patch(':id/pause')
  @ApiOperation({ summary: 'Pause the active session' })
  @ApiResponse({ status: 200, description: 'Session paused' })
  @ApiResponse({ status: 400, description: 'Session is not running' })
  pause(@Param('id') id: string, @Request() req: any) {
    return this.timeLogsService.pause(id, req.user.id);
  }

  @Patch(':id/resume')
  @ApiOperation({ summary: 'Resume a paused session' })
  @ApiResponse({ status: 200, description: 'Session resumed' })
  @ApiResponse({ status: 400, description: 'Session is not paused' })
  resume(@Param('id') id: string, @Request() req: any) {
    return this.timeLogsService.resume(id, req.user.id);
  }

  @Patch(':id/stop')
  @ApiOperation({ summary: 'Stop and finalize the session' })
  @ApiResponse({ status: 200, description: 'Session stopped' })
  @ApiResponse({ status: 400, description: 'Session is already completed' })
  stop(@Param('id') id: string, @Request() req: any) {
    return this.timeLogsService.stop(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Add or update session description' })
  @ApiResponse({ status: 200, description: 'Description updated' })
  @ApiResponse({ status: 400, description: 'Session is not completed' })
  updateDescription(
    @Param('id') id: string,
    @Body() dto: UpdateTimeLogDto,
    @Request() req: any,
  ) {
    return this.timeLogsService.updateDescription(id, dto, req.user.id);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get current active or paused session' })
  @ApiResponse({ status: 200, description: 'Active session or null' })
  findActive(@Request() req: any) {
    return this.timeLogsService.findActive(req.user.id);
  }
}
