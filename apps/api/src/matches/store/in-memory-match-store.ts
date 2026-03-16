import { Injectable } from '@nestjs/common';
import type {
  CreateMatchDto,
  CreateTimelineEventDto,
  Match,
  TimelineEvent,
  UpdateMatchDto,
  UpdateTimelineEventDto,
} from '@scrambleiq/shared';

import { EventStore } from './event-store';
import { MatchStore } from './match-store';

@Injectable()
export class InMemoryMatchStore implements MatchStore, EventStore {
  private readonly matches: Match[] = [];
  private readonly events: TimelineEvent[] = [];

  create(input: CreateMatchDto): Match;
  create(matchId: string, input: CreateTimelineEventDto): TimelineEvent;
  create(firstInput: CreateMatchDto | string, secondInput?: CreateTimelineEventDto): Match | TimelineEvent {
    if (typeof firstInput === 'string') {
      const event: TimelineEvent = {
        id: crypto.randomUUID(),
        matchId: firstInput,
        timestamp: secondInput!.timestamp,
        eventType: secondInput!.eventType,
        competitor: secondInput!.competitor,
        notes: secondInput!.notes,
      };

      this.events.push(event);
      return event;
    }

    const match: Match = {
      id: crypto.randomUUID(),
      title: firstInput.title,
      date: firstInput.date,
      ruleset: firstInput.ruleset,
      competitorA: firstInput.competitorA,
      competitorB: firstInput.competitorB,
      notes: firstInput.notes ?? '',
    };

    this.matches.push(match);
    return match;
  }

  findAll(): Match[] {
    return [...this.matches].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  }

  findById(id: string): Match | undefined {
    return this.matches.find((match) => match.id === id);
  }

  findByMatchId(matchId: string): TimelineEvent[] {
    return this.events
      .filter((event) => event.matchId === matchId)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  update(id: string, input: UpdateMatchDto): Match | undefined;
  update(id: string, input: UpdateTimelineEventDto): TimelineEvent | undefined;
  update(id: string, input: UpdateMatchDto | UpdateTimelineEventDto): Match | TimelineEvent | undefined {
    const matchIndex = this.matches.findIndex((match) => match.id === id);

    if (matchIndex >= 0) {
      const currentMatch = this.matches[matchIndex];
      const updatedMatch: Match = {
        ...currentMatch,
        ...(input as UpdateMatchDto),
        notes: (input as UpdateMatchDto).notes ?? currentMatch.notes,
      };

      this.matches[matchIndex] = updatedMatch;
      return updatedMatch;
    }

    const eventIndex = this.events.findIndex((event) => event.id === id);

    if (eventIndex < 0) {
      return undefined;
    }

    const currentEvent = this.events[eventIndex];
    const updatePayload = input as UpdateTimelineEventDto;
    const updatedEvent: TimelineEvent = {
      ...currentEvent,
      ...updatePayload,
      notes: updatePayload.notes ?? currentEvent.notes,
    };

    this.events[eventIndex] = updatedEvent;
    return updatedEvent;
  }

  delete(id: string): boolean {
    const matchIndex = this.matches.findIndex((match) => match.id === id);

    if (matchIndex >= 0) {
      const [deletedMatch] = this.matches.splice(matchIndex, 1);
      this.deleteByMatchId(deletedMatch.id);
      return true;
    }

    const eventIndex = this.events.findIndex((event) => event.id === id);

    if (eventIndex < 0) {
      return false;
    }

    this.events.splice(eventIndex, 1);
    return true;
  }

  deleteByMatchId(matchId: string): void {
    const remainingEvents = this.events.filter((event) => event.matchId !== matchId);
    this.events.splice(0, this.events.length, ...remainingEvents);
  }
}
