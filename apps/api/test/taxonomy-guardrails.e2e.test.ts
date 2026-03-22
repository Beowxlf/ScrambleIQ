import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';

describe('TaxonomyGuardrails', () => {
  let app: INestApplication;
  const apiAuthToken = 'test-api-token';

  function requestWithAuth(method: 'get' | 'post', path: string) {
    return request(app.getHttpServer())[method](path).set('x-api-key', apiAuthToken);
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
    await app.close();
  });

  async function createMatch(): Promise<string> {
    const response = await requestWithAuth('post', '/matches').send({
      title: 'Taxonomy Review Match',
      date: '2026-03-01',
      ruleset: 'Folkstyle',
      competitorA: 'Alex Carter',
      competitorB: 'Sam Jordan',
    }).expect(201);

    return response.body.id as string;
  }

  async function createEvent(matchId: string, eventType: string): Promise<void> {
    await requestWithAuth('post', `/matches/${matchId}/events`)
      .send({ timestamp: 12, eventType, competitor: 'A' })
      .expect(201);
  }

  it('evaluates event-type guardrail warnings for canonical variants', async () => {
    const matchId = await createMatch();
    await createEvent(matchId, 'Guard Pass');
    await createEvent(matchId, 'guard_pass');

    const response = await requestWithAuth('get', `/matches/${matchId}/taxonomy-guardrails`).expect(200);

    expect(response.body.hasWarnings).toBe(true);
    expect(response.body.warningCount).toBe(1);
    expect(response.body.warnings[0]).toMatchObject({
      field: 'eventType',
      observedValue: 'Guard Pass',
      canonicalValue: 'guard_pass',
      severity: 'WARNING',
    });
  });

  it('returns no warnings when all event labels already use canonical values', async () => {
    const matchId = await createMatch();
    await createEvent(matchId, 'guard_pass');

    const response = await requestWithAuth('get', `/matches/${matchId}/taxonomy-guardrails`).expect(200);

    expect(response.body).toEqual({
      hasWarnings: false,
      warningCount: 0,
      warnings: [],
    });
  });

  it('handles explicit normalization request and updates matching events only', async () => {
    const matchId = await createMatch();
    await createEvent(matchId, 'Guard Pass');
    await createEvent(matchId, 'Guard Pass');
    await createEvent(matchId, 'sweep');

    const response = await requestWithAuth('post', `/matches/${matchId}/taxonomy-normalization`)
      .send({
        field: 'eventType',
        fromValue: 'Guard Pass',
        toValue: 'guard_pass',
        action: 'apply_canonical',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      field: 'eventType',
      matchId,
      fromValue: 'Guard Pass',
      toValue: 'guard_pass',
      action: 'apply_canonical',
      updatedEventCount: 2,
    });

    const eventsResponse = await requestWithAuth('get', `/matches/${matchId}/events`).expect(200);
    expect(eventsResponse.body.map((event: { eventType: string }) => event.eventType).sort()).toEqual([
      'guard_pass',
      'guard_pass',
      'sweep',
    ]);
  });

  it('returns not-found and validation errors for taxonomy endpoints', async () => {
    const missingMatchId = '11111111-1111-4111-8111-111111111111';

    await requestWithAuth('get', `/matches/${missingMatchId}/taxonomy-guardrails`).expect(404);

    const createdMatchId = await createMatch();
    const invalidResponse = await requestWithAuth('post', `/matches/${createdMatchId}/taxonomy-normalization`)
      .send({
        field: 'eventType',
        fromValue: '',
        toValue: 'guard_pass',
        action: 'apply_canonical',
      })
      .expect(400);

    expect(invalidResponse.body.message).toContain('fromValue should not be empty');
  });
});
