import { describe, expect, it } from 'vitest';

import type { Match, MatchAnalyticsSummary, MatchVideo, PositionState, TimelineEvent } from '@scrambleiq/shared';

import { DatasetValidationService } from '../src/matches/dataset-validation.service';
import type { EventStore } from '../src/matches/store/event-store';
import type { MatchStore } from '../src/matches/store/match-store';
import type { PositionStore } from '../src/matches/store/position-store';
import type { VideoStore } from '../src/matches/store/video-store';

function createServiceFixture(params: {
  match: Match | undefined;
  events?: TimelineEvent[];
  positions?: PositionState[];
  video?: MatchVideo | undefined;
}) {
  const events = params.events ?? [];
  const positions = params.positions ?? [];

  const matchStore: MatchStore = {
    create: () => {
      throw new Error('unused');
    },
    findAll: () => [],
    findById: () => params.match,
    update: () => undefined,
    delete: () => false,
  };

  const eventStore: EventStore = {
    create: () => {
      throw new Error('unused');
    },
    findByMatchId: () => events,
    findEventById: () => undefined,
    update: () => undefined,
    delete: () => false,
    deleteByMatchId: () => undefined,
  };

  const positionStore: PositionStore = {
    create: () => {
      throw new Error('unused');
    },
    findPositionsByMatchId: () => positions,
    findPositionById: () => undefined,
    update: () => undefined,
    delete: () => false,
    deleteByMatchId: () => undefined,
  };

  const videoStore: VideoStore = {
    create: () => {
      throw new Error('unused');
    },
    findVideoByMatchId: () => params.video,
    findVideoById: () => undefined,
    update: () => undefined,
    delete: () => false,
    deleteByMatchId: () => undefined,
  };

  return new DatasetValidationService(matchStore, eventStore, positionStore, videoStore);
}

function emptyAnalytics(matchId: string): MatchAnalyticsSummary {
  return {
    matchId,
    totalEventCount: 0,
    eventCountsByType: {},
    totalPositionCount: 0,
    timeInPositionByTypeSeconds: {
      standing: 0,
      closed_guard: 0,
      open_guard: 0,
      half_guard: 0,
      side_control: 0,
      mount: 0,
      back_control: 0,
      north_south: 0,
      leg_entanglement: 0,
      scramble: 0,
    },
    competitorTopTimeByPositionSeconds: {
      A: { standing: 0, closed_guard: 0, open_guard: 0, half_guard: 0, side_control: 0, mount: 0, back_control: 0, north_south: 0, leg_entanglement: 0, scramble: 0 },
      B: { standing: 0, closed_guard: 0, open_guard: 0, half_guard: 0, side_control: 0, mount: 0, back_control: 0, north_south: 0, leg_entanglement: 0, scramble: 0 },
    },
    totalTrackedPositionTimeSeconds: 0,
  };
}

describe('DatasetValidationService', () => {
  const matchId = '11111111-1111-4111-8111-111111111111';
  const match: Match = {
    id: matchId,
    title: 'Sample',
    date: '2026-04-01',
    ruleset: 'No-Gi',
    competitorA: 'A',
    competitorB: 'B',
    notes: '',
  };

  it('returns a validation report', () => {
    const service = createServiceFixture({ match });

    const report = service.validateMatchDataset(matchId, emptyAnalytics(matchId));

    expect(report.matchId).toBe(matchId);
    expect(report.issueCount).toBeGreaterThan(0);
  });

  it('detects overlapping position segments', () => {
    const service = createServiceFixture({
      match,
      positions: [
        { id: 'p1', matchId, position: 'standing', competitorTop: 'A', timestampStart: 0, timestampEnd: 20 },
        { id: 'p2', matchId, position: 'mount', competitorTop: 'A', timestampStart: 10, timestampEnd: 30 },
      ],
    });

    const report = service.validateMatchDataset(matchId, emptyAnalytics(matchId));

    expect(report.issues.some((issue) => issue.type === 'POSITION_OVERLAP')).toBe(true);
    expect(report.isValid).toBe(false);
  });

  it('detects invalid timestamps', () => {
    const service = createServiceFixture({
      match,
      events: [{ id: 'e1', matchId, timestamp: -3, eventType: 'takedown_attempt', competitor: 'A' }],
      positions: [{ id: 'p1', matchId, position: 'standing', competitorTop: 'A', timestampStart: 30, timestampEnd: 10 }],
    });

    const report = service.validateMatchDataset(matchId, emptyAnalytics(matchId));

    expect(report.issues.some((issue) => issue.type === 'NEGATIVE_TIMESTAMP')).toBe(true);
    expect(report.issues.some((issue) => issue.type === 'INVALID_TIMESTAMP_ORDER')).toBe(true);
    expect(report.isValid).toBe(false);
  });

  it('detects empty matches', () => {
    const service = createServiceFixture({ match });

    const report = service.validateMatchDataset(matchId, emptyAnalytics(matchId));

    expect(report.issues.some((issue) => issue.type === 'EMPTY_MATCH')).toBe(true);
    expect(report.isValid).toBe(false);
  });

  it('throws for unknown matches', () => {
    const service = createServiceFixture({ match: undefined });

    expect(() => service.validateMatchDataset(matchId, emptyAnalytics(matchId))).toThrow(
      `Match with id ${matchId} was not found.`,
    );
  });
});
