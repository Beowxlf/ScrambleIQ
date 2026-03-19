import { describe, expect, it } from 'vitest';

import type { Match, MatchAnalyticsSummary, MatchVideo, PositionState, TimelineEvent } from '@scrambleiq/shared';

import { DatasetValidationService } from '../src/matches/dataset-validation.service';
import type { EventRepository } from '../src/repositories/event.repository';
import type { MatchRepository } from '../src/repositories/match.repository';
import type { PositionRepository } from '../src/repositories/position.repository';
import type { VideoRepository } from '../src/repositories/video.repository';

function createServiceFixture(params: {
  match: Match | undefined;
  events?: TimelineEvent[];
  positions?: PositionState[];
  video?: MatchVideo | undefined;
}) {
  const events = params.events ?? [];
  const positions = params.positions ?? [];

  const matchRepository: MatchRepository = {
    create: async () => {
      throw new Error('unused');
    },
    findAll: async () => [],
    findAllSummaries: async () => [],
    findById: async () => params.match,
    update: async () => undefined,
    delete: async () => false,
  };

  const eventRepository: EventRepository = {
    create: async () => {
      throw new Error('unused');
    },
    findByMatchId: async () => events,
    findById: async () => undefined,
    update: async () => undefined,
    delete: async () => false,
  };

  const positionRepository: PositionRepository = {
    create: async () => {
      throw new Error('unused');
    },
    findByMatchId: async () => positions,
    findById: async () => undefined,
    update: async () => undefined,
    delete: async () => false,
  };

  const videoRepository: VideoRepository = {
    create: async () => {
      throw new Error('unused');
    },
    findByMatchId: async () => params.video,
    findById: async () => undefined,
    update: async () => undefined,
    delete: async () => false,
  };

  return new DatasetValidationService(matchRepository, eventRepository, positionRepository, videoRepository);
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

  it('returns a validation report', async () => {
    const service = createServiceFixture({ match });

    const report = await service.validateMatchDataset(matchId, emptyAnalytics(matchId));

    expect(report.matchId).toBe(matchId);
    expect(report.issueCount).toBeGreaterThan(0);
  });

  it('detects overlapping position segments', async () => {
    const service = createServiceFixture({
      match,
      positions: [
        { id: 'p1', matchId, position: 'standing', competitorTop: 'A', timestampStart: 0, timestampEnd: 20 },
        { id: 'p2', matchId, position: 'mount', competitorTop: 'A', timestampStart: 10, timestampEnd: 30 },
      ],
    });

    const report = await service.validateMatchDataset(matchId, emptyAnalytics(matchId));

    expect(report.issues.some((issue) => issue.type === 'POSITION_OVERLAP')).toBe(true);
    expect(report.isValid).toBe(false);
  });

  it('detects invalid timestamps', async () => {
    const service = createServiceFixture({
      match,
      events: [{ id: 'e1', matchId, timestamp: -3, eventType: 'takedown_attempt', competitor: 'A' }],
      positions: [{ id: 'p1', matchId, position: 'standing', competitorTop: 'A', timestampStart: 30, timestampEnd: 10 }],
    });

    const report = await service.validateMatchDataset(matchId, emptyAnalytics(matchId));

    expect(report.issues.some((issue) => issue.type === 'NEGATIVE_TIMESTAMP')).toBe(true);
    expect(report.issues.some((issue) => issue.type === 'INVALID_TIMESTAMP_ORDER')).toBe(true);
    expect(report.isValid).toBe(false);
  });

  it('detects empty matches', async () => {
    const service = createServiceFixture({ match });

    const report = await service.validateMatchDataset(matchId, emptyAnalytics(matchId));

    expect(report.issues.some((issue) => issue.type === 'EMPTY_MATCH')).toBe(true);
    expect(report.isValid).toBe(false);
  });

  it('throws for unknown matches', async () => {
    const service = createServiceFixture({ match: undefined });

    await expect(service.validateMatchDataset(matchId, emptyAnalytics(matchId))).rejects.toThrow(
      `Match with id ${matchId} was not found.`,
    );
  });

  it('detects sorting issues for unsorted events and positions', async () => {
    const service = createServiceFixture({
      match,
      events: [
        { id: 'e2', matchId, timestamp: 12, eventType: 'entry', competitor: 'A' },
        { id: 'e1', matchId, timestamp: 5, eventType: 'entry', competitor: 'A' },
      ],
      positions: [
        { id: 'p2', matchId, position: 'mount', competitorTop: 'A', timestampStart: 15, timestampEnd: 18 },
        { id: 'p1', matchId, position: 'standing', competitorTop: 'A', timestampStart: 0, timestampEnd: 10 },
      ],
    });

    const report = await service.validateMatchDataset(matchId, emptyAnalytics(matchId));

    const orderingIssues = report.issues.filter((issue) => issue.type === 'INVALID_TIMESTAMP_ORDER');
    expect(orderingIssues).toHaveLength(2);
    expect(orderingIssues.map((issue) => issue.message)).toEqual(
      expect.arrayContaining([
        'Events are not sorted by timestamp in ascending order.',
        'Positions are not sorted by timestampStart in ascending order.',
      ]),
    );
  });

  it('flags events that fall outside all position ranges', async () => {
    const service = createServiceFixture({
      match,
      events: [
        { id: 'e1', matchId, timestamp: 2, eventType: 'entry', competitor: 'A' },
        { id: 'e2', matchId, timestamp: 25, eventType: 'entry', competitor: 'A' },
      ],
      positions: [{ id: 'p1', matchId, position: 'standing', competitorTop: 'A', timestampStart: 5, timestampEnd: 20 }],
    });

    const summary = emptyAnalytics(matchId);
    summary.totalEventCount = 2;
    summary.totalPositionCount = 1;
    summary.eventCountsByType = { entry: 2 };
    summary.timeInPositionByTypeSeconds.standing = 15;
    summary.competitorTopTimeByPositionSeconds.A.standing = 15;
    summary.totalTrackedPositionTimeSeconds = 15;

    const report = await service.validateMatchDataset(matchId, summary);

    const outOfRangeIssues = report.issues.filter((issue) => issue.type === 'EVENT_OUT_OF_RANGE');
    expect(outOfRangeIssues).toHaveLength(2);
    expect(outOfRangeIssues.map((issue) => issue.context?.eventId)).toEqual(['e1', 'e2']);
  });

  it('detects analytics mismatches for stale summaries', async () => {
    const service = createServiceFixture({
      match,
      events: [{ id: 'e1', matchId, timestamp: 5, eventType: 'guard_pass', competitor: 'A' }],
      positions: [{ id: 'p1', matchId, position: 'mount', competitorTop: 'A', timestampStart: 10, timestampEnd: 20 }],
      video: {
        id: 'v1',
        matchId,
        title: 'Main',
        sourceType: 'remote_url',
        sourceUrl: 'https://example.com/video.mp4',
      },
    });

    const staleSummary = emptyAnalytics(matchId);
    const report = await service.validateMatchDataset(matchId, staleSummary);

    const mismatch = report.issues.find((issue) => issue.type === 'ANALYTICS_MISMATCH');
    expect(mismatch).toBeDefined();
    expect(mismatch?.context).toMatchObject({
      expectedTotalEventCount: 1,
      actualTotalEventCount: 0,
      expectedTotalPositionCount: 1,
      actualTotalPositionCount: 0,
    });
  });
});
