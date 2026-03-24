import { describe, expect, it } from 'vitest';

import type {
  DatasetValidationReport,
  Match,
  MatchAnalyticsSummary,
  MatchDatasetExport,
  MatchVideo,
  PositionState,
  TimelineEvent,
} from '@scrambleiq/shared';

import { ReportsService } from '../src/modules/reports/reports.service';
import type { DatasetValidationService } from '../src/matches/dataset-validation.service';
import type { MatchesService } from '../src/matches/matches.service';
import type { EventRepository } from '../src/repositories/event.repository';
import type { MatchRepository } from '../src/repositories/match.repository';
import type { PositionRepository } from '../src/repositories/position.repository';
import type { VideoRepository } from '../src/repositories/video.repository';

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

function createFixture(params: {
  matches: Match[];
  eventsByMatch?: Record<string, TimelineEvent[]>;
  positionsByMatch?: Record<string, PositionState[]>;
  videosByMatch?: Record<string, MatchVideo | undefined>;
  validationReportsByMatch?: Record<string, DatasetValidationReport>;
}) {
  const eventsByMatch = params.eventsByMatch ?? {};
  const positionsByMatch = params.positionsByMatch ?? {};
  const videosByMatch = params.videosByMatch ?? {};
  const validationReportsByMatch = params.validationReportsByMatch ?? {};

  const matchRepository: MatchRepository = {
    create: async () => { throw new Error('unused'); },
    findAll: async () => params.matches,
    findAllSummaries: async () => [],
    findById: async () => undefined,
    update: async () => undefined,
    delete: async () => false,
  };

  const eventRepository: EventRepository = {
    create: async () => { throw new Error('unused'); },
    findByMatchId: async (matchId) => eventsByMatch[matchId] ?? [],
    findById: async () => undefined,
    update: async () => undefined,
    delete: async () => false,
  };

  const positionRepository: PositionRepository = {
    create: async () => { throw new Error('unused'); },
    findByMatchId: async (matchId) => positionsByMatch[matchId] ?? [],
    findById: async () => undefined,
    update: async () => undefined,
    delete: async () => false,
  };

  const videoRepository: VideoRepository = {
    create: async () => { throw new Error('unused'); },
    findByMatchId: async (matchId) => videosByMatch[matchId],
    findById: async () => undefined,
    update: async () => undefined,
    delete: async () => false,
  };

  const matchesService: Pick<MatchesService, 'getAnalytics' | 'exportDataset'> = {
    getAnalytics: async (matchId: string) => emptyAnalytics(matchId),
    exportDataset: async (matchId: string) => ({
      match: params.matches.find((entry) => entry.id === matchId)!,
      video: null,
      events: [],
      positions: [],
      analytics: emptyAnalytics(matchId),
    } satisfies MatchDatasetExport),
  };

  const datasetValidationService: Pick<DatasetValidationService, 'validateMatchDataset'> = {
    validateMatchDataset: async (matchId: string) => validationReportsByMatch[matchId] ?? {
      matchId,
      isValid: true,
      issueCount: 0,
      issues: [],
    },
  };

  return new ReportsService(
    matchRepository,
    eventRepository,
    positionRepository,
    videoRepository,
    matchesService as MatchesService,
    datasetValidationService as DatasetValidationService,
  );
}

describe('ReportsService insight engine', () => {
  const baseFilters = {
    dateRange: {
      startDate: '2026-03-01',
      endDate: '2026-03-31',
    },
  };

  it('generates collection insights when thresholds are exceeded', async () => {
    const matches: Match[] = [
      { id: 'm1', title: 'M1', date: '2026-03-01', ruleset: 'folkstyle', competitorA: 'A', competitorB: 'B', notes: '' },
      { id: 'm2', title: 'M2', date: '2026-03-02', ruleset: 'folkstyle', competitorA: 'A', competitorB: 'B', notes: '' },
      { id: 'm3', title: 'M3', date: '2026-03-03', ruleset: 'folkstyle', competitorA: 'A', competitorB: 'B', notes: '' },
    ];

    const service = createFixture({
      matches,
      eventsByMatch: {
        m1: [
          { id: 'e1', matchId: 'm1', timestamp: 1, eventType: 'guard_retention', competitor: 'A' },
          { id: 'e2', matchId: 'm1', timestamp: 2, eventType: 'guard_retention', competitor: 'A' },
          { id: 'e3', matchId: 'm1', timestamp: 3, eventType: 'guard_retention', competitor: 'A' },
          { id: 'e4', matchId: 'm1', timestamp: 4, eventType: 'sweep', competitor: 'A' },
        ],
        m2: [
          { id: 'e5', matchId: 'm2', timestamp: 1, eventType: 'guard_retention', competitor: 'A' },
          { id: 'e6', matchId: 'm2', timestamp: 2, eventType: 'guard_retention', competitor: 'A' },
          { id: 'e7', matchId: 'm2', timestamp: 3, eventType: 'entry', competitor: 'A' },
        ],
        m3: [
          { id: 'e8', matchId: 'm3', timestamp: 1, eventType: 'guard_retention', competitor: 'A' },
          { id: 'e9', matchId: 'm3', timestamp: 2, eventType: 'guard_retention', competitor: 'A' },
        ],
      },
      positionsByMatch: {
        m1: [{ id: 'p1', matchId: 'm1', position: 'half_guard', competitorTop: 'A', timestampStart: 0, timestampEnd: 40 }],
        m2: [{ id: 'p2', matchId: 'm2', position: 'half_guard', competitorTop: 'A', timestampStart: 0, timestampEnd: 30 }],
        m3: [{ id: 'p3', matchId: 'm3', position: 'standing', competitorTop: 'A', timestampStart: 0, timestampEnd: 10 }],
      },
    });

    const report = await service.getCollectionSummary(baseFilters);

    expect(report.insights.length).toBeGreaterThan(0);
    expect(report.insights.join(' ')).toContain('Guard Retention');
    expect(report.insights.join(' ')).toContain('Half Guard');

    const reportAgain = await service.getCollectionSummary(baseFilters);
    expect(reportAgain.insights).toEqual(report.insights);
  });

  it('suppresses collection insights when data is insignificant', async () => {
    const service = createFixture({
      matches: [
        { id: 'm1', title: 'M1', date: '2026-03-02', ruleset: 'folkstyle', competitorA: 'A', competitorB: 'B', notes: '' },
      ],
      eventsByMatch: {
        m1: [{ id: 'e1', matchId: 'm1', timestamp: 1, eventType: 'entry', competitor: 'A' }],
      },
      positionsByMatch: {
        m1: [{ id: 'p1', matchId: 'm1', position: 'standing', competitorTop: 'A', timestampStart: 0, timestampEnd: 4 }],
      },
    });

    const report = await service.getCollectionSummary(baseFilters);
    expect(report.insights).toEqual([]);
  });

  it('generates trend insights for significant deltas and includes context windows', async () => {
    const matches: Match[] = [
      { id: 'c1', title: 'C1', date: '2026-03-10', ruleset: 'folkstyle', competitorA: 'Jordan', competitorB: 'X', notes: '' },
      { id: 'c2', title: 'C2', date: '2026-03-11', ruleset: 'folkstyle', competitorA: 'Jordan', competitorB: 'Y', notes: '' },
      { id: 'c3', title: 'C3', date: '2026-03-12', ruleset: 'folkstyle', competitorA: 'Jordan', competitorB: 'Z', notes: '' },
      { id: 'p1', title: 'P1', date: '2026-03-07', ruleset: 'folkstyle', competitorA: 'Jordan', competitorB: 'X', notes: '' },
      { id: 'p2', title: 'P2', date: '2026-03-08', ruleset: 'folkstyle', competitorA: 'Jordan', competitorB: 'Y', notes: '' },
      { id: 'p3', title: 'P3', date: '2026-03-09', ruleset: 'folkstyle', competitorA: 'Jordan', competitorB: 'Z', notes: '' },
    ];

    const service = createFixture({
      matches,
      eventsByMatch: {
        c1: Array.from({ length: 1 }, (_, idx) => ({ id: `ce1-${idx}`, matchId: 'c1', timestamp: idx, eventType: 'takedown', competitor: 'A' as const })),
        c2: Array.from({ length: 1 }, (_, idx) => ({ id: `ce2-${idx}`, matchId: 'c2', timestamp: idx, eventType: 'takedown', competitor: 'A' as const })),
        c3: Array.from({ length: 1 }, (_, idx) => ({ id: `ce3-${idx}`, matchId: 'c3', timestamp: idx, eventType: 'takedown', competitor: 'A' as const })),
        p1: Array.from({ length: 4 }, (_, idx) => ({ id: `pe1-${idx}`, matchId: 'p1', timestamp: idx, eventType: 'takedown', competitor: 'A' as const })),
        p2: Array.from({ length: 4 }, (_, idx) => ({ id: `pe2-${idx}`, matchId: 'p2', timestamp: idx, eventType: 'takedown', competitor: 'A' as const })),
        p3: Array.from({ length: 4 }, (_, idx) => ({ id: `pe3-${idx}`, matchId: 'p3', timestamp: idx, eventType: 'takedown', competitor: 'A' as const })),
      },
      positionsByMatch: {
        c1: [{ id: 'cp1', matchId: 'c1', position: 'mount', competitorTop: 'A', timestampStart: 0, timestampEnd: 20 }],
        c2: [{ id: 'cp2', matchId: 'c2', position: 'mount', competitorTop: 'A', timestampStart: 0, timestampEnd: 20 }],
        c3: [{ id: 'cp3', matchId: 'c3', position: 'mount', competitorTop: 'A', timestampStart: 0, timestampEnd: 20 }],
        p1: [{ id: 'pp1', matchId: 'p1', position: 'mount', competitorTop: 'A', timestampStart: 0, timestampEnd: 10 }],
        p2: [{ id: 'pp2', matchId: 'p2', position: 'mount', competitorTop: 'A', timestampStart: 0, timestampEnd: 10 }],
        p3: [{ id: 'pp3', matchId: 'p3', position: 'mount', competitorTop: 'A', timestampStart: 0, timestampEnd: 10 }],
      },
    });

    const report = await service.getCompetitorTrendSummary('jordan', {
      dateRange: { startDate: '2026-03-10', endDate: '2026-03-12' },
    });

    expect(report.insights.length).toBeGreaterThan(0);
    expect(report.insights.join(' ')).toContain('2026-03-07 to 2026-03-09');
    expect(report.insights.join(' ')).toContain('2026-03-10 to 2026-03-12');
  });

  it('suppresses trend insights on low sample size and keeps field present', async () => {
    const service = createFixture({
      matches: [
        { id: 'c1', title: 'C1', date: '2026-03-10', ruleset: 'folkstyle', competitorA: 'Jordan', competitorB: 'X', notes: '' },
        { id: 'p1', title: 'P1', date: '2026-03-09', ruleset: 'folkstyle', competitorA: 'Jordan', competitorB: 'X', notes: '' },
      ],
      eventsByMatch: {
        c1: [{ id: 'e1', matchId: 'c1', timestamp: 1, eventType: 'takedown', competitor: 'A' }],
        p1: [{ id: 'e2', matchId: 'p1', timestamp: 1, eventType: 'takedown', competitor: 'A' }],
      },
    });

    const report = await service.getCompetitorTrendSummary('jordan', {
      dateRange: { startDate: '2026-03-10', endDate: '2026-03-10' },
    });

    expect(report.dataSufficiency.isSufficient).toBe(false);
    expect(report.insights).toEqual([]);
  });

  it('generates validation insights for high error rates and recurring issues with no false positives', async () => {
    const matches: Match[] = [
      { id: 'm1', title: 'M1', date: '2026-03-01', ruleset: 'folkstyle', competitorA: 'A', competitorB: 'B', notes: '' },
      { id: 'm2', title: 'M2', date: '2026-03-02', ruleset: 'folkstyle', competitorA: 'A', competitorB: 'B', notes: '' },
      { id: 'm3', title: 'M3', date: '2026-03-03', ruleset: 'folkstyle', competitorA: 'A', competitorB: 'B', notes: '' },
      { id: 'm4', title: 'M4', date: '2026-03-04', ruleset: 'folkstyle', competitorA: 'A', competitorB: 'B', notes: '' },
    ];

    const serviceWithIssues = createFixture({
      matches,
      validationReportsByMatch: {
        m1: { matchId: 'm1', isValid: false, issueCount: 1, issues: [{ type: 'POSITION_OVERLAP', severity: 'ERROR', message: 'x' }] },
        m2: { matchId: 'm2', isValid: false, issueCount: 1, issues: [{ type: 'POSITION_OVERLAP', severity: 'ERROR', message: 'x' }] },
        m3: { matchId: 'm3', isValid: true, issueCount: 1, issues: [{ type: 'MISSING_VIDEO', severity: 'WARNING', message: 'x' }] },
        m4: { matchId: 'm4', isValid: true, issueCount: 0, issues: [] },
      },
    });

    const withInsights = await serviceWithIssues.getCollectionValidationReport(baseFilters);
    expect(withInsights.insights.length).toBeGreaterThan(0);
    expect(withInsights.insights.join(' ')).toContain('POSITION OVERLAP');

    const serviceWithoutIssues = createFixture({ matches });
    const withoutInsights = await serviceWithoutIssues.getCollectionValidationReport(baseFilters);
    expect(withoutInsights.insights).toEqual([]);
  });

  it('keeps response integrity by always providing additive insights fields', async () => {
    const service = createFixture({ matches: [] });

    const summary = await service.getCollectionSummary(baseFilters);
    const trends = await service.getCompetitorTrendSummary('nobody', baseFilters);
    const validation = await service.getCollectionValidationReport(baseFilters);

    expect(summary).toHaveProperty('totals');
    expect(summary).toHaveProperty('insights');
    expect(trends).toHaveProperty('windows');
    expect(trends).toHaveProperty('insights');
    expect(validation).toHaveProperty('issueCountsBySeverity');
    expect(validation).toHaveProperty('insights');
  });
});
