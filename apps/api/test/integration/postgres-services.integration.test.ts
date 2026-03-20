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
});
