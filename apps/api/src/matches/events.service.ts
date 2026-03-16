import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { TimelineEvent } from '@scrambleiq/shared';

import { EventRepository, EVENT_REPOSITORY } from '../repositories/event.repository';
import { MatchRepository, MATCH_REPOSITORY } from '../repositories/match.repository';
import { CreateTimelineEventDto } from './create-timeline-event.dto';
import { validateCreateTimelineEventPayload, validateUpdateTimelineEventPayload } from './timeline-event-validation';
import { UpdateTimelineEventDto } from './update-timeline-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
    @Inject(MATCH_REPOSITORY) private readonly matchRepository: MatchRepository,
  ) {}

  async create(matchId: string, input: CreateTimelineEventDto): Promise<TimelineEvent> {
    const errors = validateCreateTimelineEventPayload(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const match = await this.matchRepository.findById(matchId);

    if (!match) {
      throw new NotFoundException(`Match with id ${matchId} was not found.`);
    }

    return this.eventRepository.create(matchId, input);
  }

  async findByMatch(matchId: string): Promise<TimelineEvent[]> {
    const match = await this.matchRepository.findById(matchId);

    if (!match) {
      throw new NotFoundException(`Match with id ${matchId} was not found.`);
    }

    return this.eventRepository.findByMatchId(matchId);
  }

  async update(id: string, input: UpdateTimelineEventDto): Promise<TimelineEvent> {
    const errors = validateUpdateTimelineEventPayload(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    if (Object.keys(input).length === 0) {
      throw new BadRequestException(['At least one field must be provided for update']);
    }

    const existingEvent = await this.eventRepository.findById(id);

    if (!existingEvent) {
      throw new NotFoundException(`Timeline event with id ${id} was not found.`);
    }

    const updatedEvent = await this.eventRepository.update(id, input);

    if (!updatedEvent) {
      throw new NotFoundException(`Timeline event with id ${id} was not found.`);
    }

    return updatedEvent;
  }

  async delete(id: string): Promise<void> {
    const existingEvent = await this.eventRepository.findById(id);

    if (!existingEvent) {
      throw new NotFoundException(`Timeline event with id ${id} was not found.`);
    }

    const isDeleted = await this.eventRepository.delete(id);

    if (!isDeleted) {
      throw new NotFoundException(`Timeline event with id ${id} was not found.`);
    }
  }
}
