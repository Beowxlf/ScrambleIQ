import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { TimelineEvent } from '@scrambleiq/shared';

import { CreateTimelineEventDto } from './create-timeline-event.dto';
import { validateCreateTimelineEventPayload, validateUpdateTimelineEventPayload } from './timeline-event-validation';
import { UpdateTimelineEventDto } from './update-timeline-event.dto';
import { EventStore } from './store/event-store';
import { EVENT_STORE } from './store/event-store.token';
import { MatchStore } from './store/match-store';
import { MATCH_STORE } from './store/match-store.token';

@Injectable()
export class EventsService {
  constructor(
    @Inject(EVENT_STORE) private readonly eventStore: EventStore,
    @Inject(MATCH_STORE) private readonly matchStore: MatchStore,
  ) {}

  create(matchId: string, input: CreateTimelineEventDto): TimelineEvent {
    const errors = validateCreateTimelineEventPayload(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const match = this.matchStore.findById(matchId);

    if (!match) {
      throw new NotFoundException(`Match with id ${matchId} was not found.`);
    }

    return this.eventStore.create(matchId, input);
  }

  findByMatch(matchId: string): TimelineEvent[] {
    const match = this.matchStore.findById(matchId);

    if (!match) {
      throw new NotFoundException(`Match with id ${matchId} was not found.`);
    }

    return this.eventStore.findByMatchId(matchId);
  }

  update(id: string, input: UpdateTimelineEventDto): TimelineEvent {
    const errors = validateUpdateTimelineEventPayload(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const updatedEvent = this.eventStore.update(id, input);

    if (!updatedEvent) {
      throw new NotFoundException(`Timeline event with id ${id} was not found.`);
    }

    return updatedEvent;
  }

  delete(id: string): void {
    const isDeleted = this.eventStore.delete(id);

    if (!isDeleted) {
      throw new NotFoundException(`Timeline event with id ${id} was not found.`);
    }
  }
}
