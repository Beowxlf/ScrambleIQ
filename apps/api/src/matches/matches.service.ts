import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { CompetitorSide, Match, MatchAnalyticsSummary, PositionType } from '@scrambleiq/shared';
import { POSITION_TYPES } from '@scrambleiq/shared';

import { CreateMatchDto } from './create-match.dto';
import { UpdateMatchDto } from './update-match.dto';
import { validateCreateMatchPayload, validateUpdateMatchPayload } from './match-validation';
import { EventStore } from './store/event-store';
import { EVENT_STORE } from './store/event-store.token';
import { MatchStore } from './store/match-store';
import { MATCH_STORE } from './store/match-store.token';
import { PositionStore } from './store/position-store';
import { POSITION_STORE } from './store/position-store.token';
import { VideoStore } from './store/video-store';
import { VIDEO_STORE } from './store/video-store.token';

@Injectable()
export class MatchesService {
  constructor(
    @Inject(MATCH_STORE) private readonly matchStore: MatchStore,
    @Inject(EVENT_STORE) private readonly eventStore: EventStore,
    @Inject(POSITION_STORE) private readonly positionStore: PositionStore,
    @Inject(VIDEO_STORE) private readonly videoStore: VideoStore,
  ) {}

  create(input: CreateMatchDto): Match {
    const errors = validateCreateMatchPayload(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.matchStore.create(input);
  }

  findAll(): Match[] {
    return this.matchStore.findAll();
  }

  update(id: string, input: UpdateMatchDto): Match {
    const errors = validateUpdateMatchPayload(input);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    if (Object.keys(input).length === 0) {
      throw new BadRequestException(['At least one field must be provided for update']);
    }

    const updatedMatch = this.matchStore.update(id, input);

    if (!updatedMatch) {
      throw new NotFoundException(`Match with id ${id} was not found.`);
    }

    return updatedMatch;
  }



  getAnalytics(id: string): MatchAnalyticsSummary {
    const match = this.matchStore.findById(id);

    if (!match) {
      throw new NotFoundException(`Match with id ${id} was not found.`);
    }

    const events = this.eventStore.findByMatchId(id);
    const positions = this.positionStore.findPositionsByMatchId(id);

    const eventCountsByType = events.reduce<Record<string, number>>((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] ?? 0) + 1;
      return acc;
    }, {});

    const initPositionDurations = (): Record<PositionType, number> =>
      POSITION_TYPES.reduce<Record<PositionType, number>>((acc, positionType) => {
        acc[positionType] = 0;
        return acc;
      }, {} as Record<PositionType, number>);

    const initCompetitorBreakdown = (): Record<CompetitorSide, Record<PositionType, number>> => ({
      A: initPositionDurations(),
      B: initPositionDurations(),
    });

    const timeInPositionByTypeSeconds = initPositionDurations();
    const competitorTopTimeByPositionSeconds = initCompetitorBreakdown();

    let totalTrackedPositionTimeSeconds = 0;

    for (const position of positions) {
      const durationSeconds = position.timestampEnd - position.timestampStart;
      timeInPositionByTypeSeconds[position.position] += durationSeconds;
      competitorTopTimeByPositionSeconds[position.competitorTop][position.position] += durationSeconds;
      totalTrackedPositionTimeSeconds += durationSeconds;
    }

    return {
      matchId: id,
      totalEventCount: events.length,
      eventCountsByType,
      totalPositionCount: positions.length,
      timeInPositionByTypeSeconds,
      competitorTopTimeByPositionSeconds,
      totalTrackedPositionTimeSeconds,
    };
  }

  findOne(id: string): Match {
    const match = this.matchStore.findById(id);

    if (!match) {
      throw new NotFoundException(`Match with id ${id} was not found.`);
    }

    return match;
  }

  delete(id: string): void {
    const isDeleted = this.matchStore.delete(id);

    if (!isDeleted) {
      throw new NotFoundException(`Match with id ${id} was not found.`);
    }

    this.eventStore.deleteByMatchId(id);
    this.positionStore.deleteByMatchId(id);
    this.videoStore.deleteByMatchId(id);
  }
}
