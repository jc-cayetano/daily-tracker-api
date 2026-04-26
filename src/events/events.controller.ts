import { Controller, Request, Sse, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { from, Observable, switchMap } from 'rxjs';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { EventsService } from './events.service';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Sse('stream')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('auth:profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'SSE stream for real-time events' })
  @ApiQuery({ name: 'token', required: true, description: 'JWT token' })
  @ApiResponse({ status: 200, description: 'SSE stream established' })
  stream(@Request() req: AuthenticatedRequest): Observable<MessageEvent> {
    return from(this.eventsService.createStream(req.user.id, req.user.role)).pipe(
      switchMap((observable) => observable),
    );
  }
}
