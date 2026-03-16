import { Body, Controller, Delete, Get, HttpCode, Inject, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import type { TimelineEvent } from '@scrambleiq/shared';

import { CreateTimelineEventDto } from './create-timeline-event.dto';
import { EventsService } from './events.service';
import { UpdateTimelineEventDto } from './update-timeline-event.dto';

@Controller()
export class EventsController {
  constructor(@Inject(EventsService) private readonly eventsService: EventsService) {}

  @Post('matches/:id/events')
  create(@Param('id', ParseUUIDPipe) matchId: string, @Body() payload: CreateTimelineEventDto): TimelineEvent {
    return this.eventsService.create(matchId, payload);
  }

  @Get('matches/:id/events')
  findByMatch(@Param('id', ParseUUIDPipe) matchId: string): TimelineEvent[] {
    return this.eventsService.findByMatch(matchId);
  }

  @Patch('events/:id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() payload: UpdateTimelineEventDto): TimelineEvent {
    return this.eventsService.update(id, payload);
  }

  @Delete('events/:id')
  @HttpCode(204)
  delete(@Param('id', ParseUUIDPipe) id: string): void {
    this.eventsService.delete(id);
  }
}
