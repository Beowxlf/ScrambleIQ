import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/configure-app';
import { PsqlClient } from '../../src/database/database.client';
import { PostgresDatasetValidationRepository } from '../../src/repositories/postgres.repositories';
import { prepareDatabase, requireDatabaseUrl, truncateDomainTables } from './postgres-test.utils';

async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  configureApp(app);
  await app.init();
  return app;
}

const integrationApiToken = 'integration-test-api-token';

function requestWithAuth(app: INestApplication, method: 'get' | 'post' | 'patch' | 'delete', path: string) {
  return request(app.getHttpServer())[method](path).set('x-api-key', integrationApiToken);
}

describe('PostgreSQL services integration', () => {
  const client = new PsqlClient(requireDatabaseUrl());
  const validationRepository = new PostgresDatasetValidationRepository(client);

  beforeAll(async () => {
    process.env.API_AUTH_TOKEN = integrationApiToken;
    await prepareDatabase(client);
  });

  afterAll(() => {
    delete process.env.API_AUTH_TOKEN;
  });

  beforeEach(async () => {
    await truncateDomainTables(client);
  });

  it('persists events across API restarts and keeps analytics on persisted data', async () => {
    const appA = await createTestApp();

    const createMatchResponse = await requestWithAuth(appA, 'post', '/matches').send({
      title: 'Restart Match',
      date: '2026-07-01',
      ruleset: 'No-Gi',
      competitorA: 'Alpha',
      competitorB: 'Beta',
      notes: '',
    });

    expect(createMatchResponse.status).toBe(201);
    const matchId = createMatchResponse.body.id as string;

    await requestWithAuth(appA, 'post', `/matches/${matchId}/events`)
      .send({ timestamp: 5, eventType: 'takedown_attempt', competitor: 'A' })
      .expect(201);

    await requestWithAuth(appA, 'post', `/matches/${matchId}/positions`)
      .send({ position: 'standing', competitorTop: 'A', timestampStart: 0, timestampEnd: 8 })
      .expect(201);

    await appA.close();

    const appB = await createTestApp();

    const eventsResponse = await requestWithAuth(appB, 'get', `/matches/${matchId}/events`).expect(200);
    expect(eventsResponse.body).toHaveLength(1);
    expect(eventsResponse.body[0].eventType).toBe('takedown_attempt');

    const analyticsResponse = await requestWithAuth(appB, 'get', `/matches/${matchId}/analytics`).expect(200);
    expect(analyticsResponse.body.totalEventCount).toBe(1);
    expect(analyticsResponse.body.totalPositionCount).toBe(1);
    expect(analyticsResponse.body.totalTrackedPositionTimeSeconds).toBe(8);

    await appB.close();
  });

  it('persists dataset validation results in PostgreSQL', async () => {
    const app = await createTestApp();

    const createMatchResponse = await requestWithAuth(app, 'post', '/matches').send({
      title: 'Validation Persistence',
      date: '2026-07-02',
      ruleset: 'Gi',
      competitorA: 'Alpha',
      competitorB: 'Beta',
      notes: '',
    });

    expect(createMatchResponse.status).toBe(201);
    const matchId = createMatchResponse.body.id as string;

    await requestWithAuth(app, 'post', `/matches/${matchId}/events`)
      .send({ timestamp: 12, eventType: 'guard_pass', competitor: 'A' })
      .expect(201);

    const validateResponse = await requestWithAuth(app, 'get', `/matches/${matchId}/validate`).expect(200);
    expect(validateResponse.body.matchId).toBe(matchId);

    await app.close();

    const persisted = await validationRepository.findByMatchId(matchId);
    expect(persisted?.matchId).toBe(matchId);
    expect(persisted?.issueCount).toBe(validateResponse.body.issueCount);
  });

  it('persists review templates and saved review presets across API restarts', async () => {
    const appA = await createTestApp();

    const createTemplateResponse = await requestWithAuth(appA, 'post', '/review-templates')
      .send({
        name: 'Competition Review',
        description: 'Template for competition match review',
        scope: 'single_match_review',
        checklistItems: [
          { label: 'Initial exchange', isRequired: true, sortOrder: 0 },
          { label: 'Endgame sequence', isRequired: false, sortOrder: 1 },
        ],
      })
      .expect(201);
    const templateId = createTemplateResponse.body.id as string;

    const createPresetResponse = await requestWithAuth(appA, 'post', '/saved-review-presets')
      .send({
        name: 'Validation-first',
        description: 'Prioritize validation issues',
        scope: 'match_detail',
        config: {
          showOnlyValidationIssues: true,
          positionFilters: ['mount'],
        },
      })
      .expect(201);
    const presetId = createPresetResponse.body.id as string;

    await appA.close();

    const appB = await createTestApp();

    const templateList = await requestWithAuth(appB, 'get', '/review-templates').expect(200);
    expect(templateList.body).toHaveLength(1);
    expect(templateList.body[0].id).toBe(templateId);

    const templateDetail = await requestWithAuth(appB, 'get', `/review-templates/${templateId}`).expect(200);
    expect(templateDetail.body.checklistItems.map((item: { sortOrder: number }) => item.sortOrder)).toEqual([0, 1]);

    const presetList = await requestWithAuth(appB, 'get', '/saved-review-presets').expect(200);
    expect(presetList.body).toHaveLength(1);
    expect(presetList.body[0].id).toBe(presetId);

    const presetDetail = await requestWithAuth(appB, 'get', `/saved-review-presets/${presetId}`).expect(200);
    expect(presetDetail.body.config).toEqual({
      showOnlyValidationIssues: true,
      positionFilters: ['mount'],
    });

    await appB.close();
  });

  it('keeps validation and not-found behavior parity for review templates and presets on PostgreSQL runtime', async () => {
    const app = await createTestApp();
    const missingId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

    await requestWithAuth(app, 'get', `/review-templates/${missingId}`).expect(404);
    await requestWithAuth(app, 'delete', `/saved-review-presets/${missingId}`).expect(404);

    const invalidTemplateResponse = await requestWithAuth(app, 'post', '/review-templates')
      .send({
        name: 12,
        scope: 'invalid_scope',
        checklistItems: [],
      })
      .expect(400);
    expect(invalidTemplateResponse.body.message).toContain('name must be a string');
    expect(invalidTemplateResponse.body.message).toContain('scope must be one of the following values: single_match_review');

    const invalidPresetResponse = await requestWithAuth(app, 'post', '/saved-review-presets')
      .send({
        name: 'Invalid',
        scope: 'match_detail',
        config: { competitorFilter: 'C' },
      })
      .expect(400);
    expect(invalidPresetResponse.body.message).toContain('config.competitorFilter must be one of the following values: A, B');

    await app.close();
  });
});
