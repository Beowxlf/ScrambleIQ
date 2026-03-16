import { Injectable } from '@nestjs/common';
import type {
  CreateMatchDto,
  CreatePositionStateDto,
  CreateTimelineEventDto,
  Match,
  PositionState,
  TimelineEvent,
  UpdateMatchDto,
  UpdatePositionStateDto,
  UpdateTimelineEventDto,
} from '@scrambleiq/shared';

import { EventStore } from './event-store';
import { MatchStore } from './match-store';
import { PositionStore } from './position-store';

@Injectable()
export class InMemoryMatchStore implements MatchStore, EventStore, PositionStore {
  private readonly matches: Match[] = [];
  private readonly events: TimelineEvent[] = [];
  private readonly positions: PositionState[] = [];

  create(input: CreateMatchDto): Match;
  create(matchId: string, input: CreateTimelineEventDto): TimelineEvent;
  create(matchId: string, input: CreatePositionStateDto): PositionState;
  create(
    firstInput: CreateMatchDto | string,
    secondInput?: CreateTimelineEventDto | CreatePositionStateDto,
  ): Match | TimelineEvent | PositionState {
    if (typeof firstInput === 'string') {
      if ('timestamp' in secondInput!) {
        const eventInput = secondInput as CreateTimelineEventDto;
        const event: TimelineEvent = {
          id: crypto.randomUUID(),
          matchId: firstInput,
          timestamp: eventInput.timestamp,
          eventType: eventInput.eventType,
          competitor: eventInput.competitor,
          notes: eventInput.notes,
        };

        this.events.push(event);
        return event;
      }

      const positionInput = secondInput as CreatePositionStateDto;
      const positionState: PositionState = {
        id: crypto.randomUUID(),
        matchId: firstInput,
        position: positionInput.position,
        competitorTop: positionInput.competitorTop,
        timestampStart: positionInput.timestampStart,
        timestampEnd: positionInput.timestampEnd,
        notes: positionInput.notes,
      };

      this.positions.push(positionState);
      return positionState;
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

  findPositionsByMatchId(matchId: string): PositionState[] {
    return this.positions
      .filter((position) => position.matchId === matchId)
      .sort((a, b) => a.timestampStart - b.timestampStart);
  }

  update(id: string, input: UpdateMatchDto): Match | undefined;
  update(id: string, input: UpdateTimelineEventDto): TimelineEvent | undefined;
  update(id: string, input: UpdatePositionStateDto): PositionState | undefined;
  update(
    id: string,
    input: UpdateMatchDto | UpdateTimelineEventDto | UpdatePositionStateDto,
  ): Match | TimelineEvent | PositionState | undefined {
    const matchIndex = this.matches.findIndex((match) => match.id === id);

    if (matchIndex >= 0) {
      const currentMatch = this.matches[matchIndex];
      const updatePayload = input as UpdateMatchDto;
      const updatedMatch: Match = {
        ...currentMatch,
        ...updatePayload,
        notes: updatePayload.notes ?? currentMatch.notes,
      };

      this.matches[matchIndex] = updatedMatch;
      return updatedMatch;
    }

    const eventIndex = this.events.findIndex((event) => event.id === id);

    if (eventIndex >= 0) {
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

    const positionIndex = this.positions.findIndex((position) => position.id === id);

    if (positionIndex < 0) {
      return undefined;
    }

    const currentPosition = this.positions[positionIndex];
    const updatePayload = input as UpdatePositionStateDto;
    const updatedPosition: PositionState = {
      ...currentPosition,
      ...updatePayload,
      notes: updatePayload.notes ?? currentPosition.notes,
    };

    this.positions[positionIndex] = updatedPosition;
    return updatedPosition;
  }

  delete(id: string): boolean {
    const matchIndex = this.matches.findIndex((match) => match.id === id);

    if (matchIndex >= 0) {
      const [deletedMatch] = this.matches.splice(matchIndex, 1);
      this.deleteByMatchId(deletedMatch.id);
      return true;
    }

    const eventIndex = this.events.findIndex((event) => event.id === id);

    if (eventIndex >= 0) {
      this.events.splice(eventIndex, 1);
      return true;
    }

    const positionIndex = this.positions.findIndex((position) => position.id === id);

    if (positionIndex < 0) {
      return false;
    }

    this.positions.splice(positionIndex, 1);
    return true;
  }

  deleteByMatchId(matchId: string): void {
    const remainingEvents = this.events.filter((event) => event.matchId !== matchId);
    this.events.splice(0, this.events.length, ...remainingEvents);

    const remainingPositions = this.positions.filter((position) => position.matchId !== matchId);
    this.positions.splice(0, this.positions.length, ...remainingPositions);
  }
}
