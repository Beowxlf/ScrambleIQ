import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';

describe('ReportsController', () => {
  let app: INestApplication | undefined;
  const apiAuthToken = 'test-api-token';

  function requestWithAuth(method: 'get' | 'post' | 'patch', path: string) {
    return request(app!.getHttpServer())[method](path).set('x-api-key', apiAuthToken);
  }

  beforeEach(async () => {
    process.env.API_AUTH_TOKEN = apiAuthToken;
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    delete process.env.API_AUTH_TOKEN;
    if (app) {
      await app.close();
    }
  });

  async function createMatch(input?: Partial<{
    date: string;
    ruleset: string;
    competitorA: string;
    competitorB: string;
    title: string;
  }>): Promise<string> {
    const response = await requestWithAuth('post', '/matches').send({
      title: input?.title ?? 'State Finals',
      date: input?.date ?? '2026-03-01',
      ruleset: input?.ruleset ?? 'Folkstyle',
      competitorA: input?.competitorA ?? 'Alex Carter',
      competitorB: input?.competitorB ?? 'Sam Jordan',
      notes: 'Quarterfinal match',
    }).expect(201);

    return response.body.id as string;
  }

  async function createEvent(matchId: string, timestamp: number, eventType = 'takedown_attempt') {
    await requestWithAuth('post', `/matches/${matchId}/events`)
      .send({ timestamp, eventType, competitor: 'A' })
      .expect(201);
  }

  async function createPosition(matchId: string, start: number, end: number, position = 'standing') {
    await requestWithAuth('post', `/matches/${matchId}/positions`)
      .send({ position, competitorTop: 'A', timestampStart: start, timestampEnd: end })
      .expect(201);
  }

  async function attachVideo(matchId: string) {
    await requestWithAuth('post', `/matches/${matchId}/video`)
      .send({ title: 'Primary Camera', sourceType: 'remote_url', sourceUrl: 'https://example.com/video.mp4' })
      .expect(201);
  }

  it('returns correct collection summary for valid filters and subset filtering', async () => {
    const includedMatch = await createMatch({ date: '2026-03-05', ruleset: 'Folkstyle', competitorA: 'Taylor A' });
    const excludedByDate = await createMatch({ date: '2026-02-01', ruleset: 'Folkstyle', competitorA: 'Taylor A' });
    const excludedByRuleset = await createMatch({ date: '2026-03-07', ruleset: 'Freestyle', competitorA: 'Taylor A' });

    await createEvent(includedMatch, 15, 'guard_pass');
    await createEvent(includedMatch, 22, 'guard_pass');
    await createPosition(includedMatch, 0, 10, 'standing');
    await createPosition(includedMatch, 10, 30, 'half_guard');
    await attachVideo(includedMatch);

    await createEvent(excludedByDate, 10, 'sweep');
    await createEvent(excludedByRuleset, 10, 'sweep');

    const response = await requestWithAuth('get', '/reports/collection/summary?dateFrom=2026-03-01&dateTo=2026-03-31&competitor=taylor&ruleset=folkstyle').expect(200);

    expect(response.body.totals).toMatchObject({
      matchCount: 1,
      eventCount: 2,
      positionCount: 2,
      trackedPositionTimeSeconds: 30,
      videoAttachedCount: 1,
    });
    expect(response.body.eventTypeDistribution).toEqual([{ eventType: 'guard_pass', count: 2 }]);
    expect(response.body.positionTimeDistribution).toEqual([
      { position: 'standing', durationSeconds: 10 },
      { position: 'half_guard', durationSeconds: 20 },
    ]);
  });

  it('returns empty-state safe collection summary', async () => {
    const response = await requestWithAuth('get', '/reports/collection/summary?dateFrom=2026-03-01&dateTo=2026-03-31').expect(200);

    expect(response.body.isEmpty).toBe(true);
    expect(response.body.totals).toMatchObject({
      matchCount: 0,
      eventCount: 0,
      positionCount: 0,
      trackedPositionTimeSeconds: 0,
      videoAttachedCount: 0,
    });
    expect(response.body.eventTypeDistribution).toEqual([]);
    expect(response.body.positionTimeDistribution).toEqual([]);
  });

  it('returns competitor trend deltas and low sample sufficiency handling', async () => {
    const currentA = await createMatch({ date: '2026-03-10', competitorA: 'Jordan Trend' });
    const currentB = await createMatch({ date: '2026-03-12', competitorA: 'Jordan Trend' });
    const previous = await createMatch({ date: '2026-03-04', competitorA: 'Jordan Trend' });

    await createEvent(currentA, 5, 'sweep');
    await createEvent(currentB, 8, 'sweep');
    await createPosition(currentA, 0, 10, 'mount');
    await createPosition(previous, 0, 4, 'mount');

    const response = await requestWithAuth('get', '/reports/competitors/jordan%20trend/trends?dateFrom=2026-03-10&dateTo=2026-03-16').expect(200);

    expect(response.body.windows[0].window).toBe('current');
    expect(response.body.windows[1].window).toBe('previous');
    expect(response.body.eventTypeDeltas).toEqual([
      {
        eventType: 'sweep',
        currentCount: 2,
        previousCount: 0,
        deltaCount: 2,
      },
    ]);
    expect(response.body.positionTimeDeltas).toEqual([
      {
        position: 'mount',
        currentDurationSeconds: 10,
        previousDurationSeconds: 4,
        deltaDurationSeconds: 6,
      },
    ]);
    expect(response.body.dataSufficiency).toMatchObject({
      minimumMatchCount: 3,
      observedMatchCount: 2,
      isSufficient: false,
    });
  });

  it('handles trend requests with no previous data safely', async () => {
    const current = await createMatch({ date: '2026-03-15', competitorA: 'Solo Current' });
    await createEvent(current, 5, 'entry');

    const response = await requestWithAuth('get', '/reports/competitors/solo%20current/trends?dateFrom=2026-03-15&dateTo=2026-03-15').expect(200);

    expect(response.body.windows[1].matchCount).toBe(0);
    expect(response.body.windows[1].eventTypeDistribution).toEqual([]);
    expect(response.body.eventTypeDeltas).toEqual([
      {
        eventType: 'entry',
        currentCount: 1,
        previousCount: 0,
        deltaCount: 1,
      },
    ]);
  });

  it('aggregates collection validation report including mixed severities and no-issues case', async () => {
    const healthyMatch = await createMatch({ date: '2026-03-20', title: 'Healthy' });
    await createEvent(healthyMatch, 5, 'entry');
    await createPosition(healthyMatch, 0, 15, 'standing');
    await attachVideo(healthyMatch);

    const mixedIssuesMatch = await createMatch({ date: '2026-03-21', title: 'Mixed' });
    await createEvent(mixedIssuesMatch, 50, 'sweep');
    await createPosition(mixedIssuesMatch, 0, 10, 'standing');

    const response = await requestWithAuth('get', '/reports/collection/validation?dateFrom=2026-03-01&dateTo=2026-03-31').expect(200);

    expect(response.body.matches).toHaveLength(2);
    expect(response.body.issueCountsBySeverity.warning).toBeGreaterThanOrEqual(1);
    expect(response.body.issueCountsByType.find((entry: { type: string }) => entry.type === 'MISSING_VIDEO')).toBeTruthy();
    expect(response.body.issueCountsByType.find((entry: { type: string }) => entry.type === 'EVENT_OUT_OF_RANGE')).toBeTruthy();

    const noIssues = await requestWithAuth('get', '/reports/collection/validation?dateFrom=2026-04-01&dateTo=2026-04-30').expect(200);
    expect(noIssues.body.issueCount).toBe(0);
    expect(noIssues.body.matches).toEqual([]);
    expect(noIssues.body.isValid).toBe(true);
  });

  it('returns deterministic export ordering, schema version, and complete payload', async () => {
    const secondByDate = await createMatch({ date: '2026-03-11', title: 'Second' });
    const firstByDate = await createMatch({ date: '2026-03-10', title: 'First' });

    await createEvent(firstByDate, 1, 'entry');
    await createPosition(firstByDate, 0, 3, 'standing');
    await attachVideo(firstByDate);

    const response = await requestWithAuth('get', '/reports/collection/export?dateFrom=2026-03-01&dateTo=2026-03-31&artifactType=competitor_snapshot').expect(200);

    expect(response.body.metadata).toMatchObject({
      schemaVersion: 'phase4.v1',
      artifactType: 'competitor_snapshot',
      matchOrder: 'date_then_match_id',
    });

    expect(response.body.matches).toHaveLength(2);
    expect(response.body.matches[0].match.id).toBe(firstByDate);
    expect(response.body.matches[1].match.id).toBe(secondByDate);
    expect(response.body.matches[0]).toHaveProperty('events');
    expect(response.body.matches[0]).toHaveProperty('positions');
    expect(response.body.matches[0]).toHaveProperty('video');
    expect(response.body.matches[0]).toHaveProperty('analytics');
  });

  it('rejects invalid report filters and missing date range', async () => {
    const missingDates = await requestWithAuth('get', '/reports/collection/summary').expect(400);
    expect(missingDates.body.message).toContain('dateFrom is required');
    expect(missingDates.body.message).toContain('dateTo is required');

    const invalid = await requestWithAuth('get', '/reports/collection/export?dateFrom=2026-02-30&dateTo=bad-date&artifactType=invalid_enum')
      .expect(400);

    expect(invalid.body.message).toContain('dateFrom must be a valid date in YYYY-MM-DD format');
    expect(invalid.body.message).toContain('dateTo must be a valid date in YYYY-MM-DD format');
    expect(invalid.body.message).toContain('artifactType must be one of the following values: period_summary, competitor_snapshot, readiness_summary');
  });
});
