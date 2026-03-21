import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('ReviewPresetsController', () => {
  let app: INestApplication;
  const apiAuthToken = 'test-api-token';
  const missingPresetId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

  function requestWithAuth(method: 'get' | 'post' | 'patch' | 'delete', path: string) {
    return request(app.getHttpServer())[method](path).set('x-api-key', apiAuthToken);
  }

  beforeEach(async () => {
    process.env.API_AUTH_TOKEN = apiAuthToken;

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    delete process.env.API_AUTH_TOKEN;
    await app.close();
  });

  const validPresetPayload = {
    name: 'Competition review focus',
    description: 'Filters to common competition review categories',
    scope: 'match_detail',
    config: {
      eventTypeFilters: ['guard_pass', 'sweep'],
      competitorFilter: 'A',
      positionFilters: ['standing', 'half_guard'],
      showOnlyValidationIssues: false,
    },
  };

  it('creates, lists, gets, updates, and deletes saved review presets', async () => {
    const createResponse = await requestWithAuth('post', '/saved-review-presets')
      .send(validPresetPayload)
      .expect(201);

    expect(createResponse.body.id).toEqual(expect.any(String));
    expect(createResponse.body).toMatchObject({
      name: validPresetPayload.name,
      scope: 'match_detail',
      config: validPresetPayload.config,
    });

    const presetId = createResponse.body.id as string;

    const listResponse = await requestWithAuth('get', '/saved-review-presets').expect(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0]).toMatchObject({
      id: presetId,
      name: validPresetPayload.name,
      scope: 'match_detail',
    });
    expect(listResponse.body[0].config).toBeUndefined();

    const getResponse = await requestWithAuth('get', `/saved-review-presets/${presetId}`).expect(200);
    expect(getResponse.body).toMatchObject({
      id: presetId,
      name: validPresetPayload.name,
      scope: 'match_detail',
      config: validPresetPayload.config,
    });

    const updateResponse = await requestWithAuth('patch', `/saved-review-presets/${presetId}`)
      .send({
        name: 'Validation-first review',
        config: {
          showOnlyValidationIssues: true,
          positionFilters: ['mount'],
        },
      })
      .expect(200);

    expect(updateResponse.body.name).toBe('Validation-first review');
    expect(updateResponse.body.config).toEqual({
      showOnlyValidationIssues: true,
      positionFilters: ['mount'],
    });

    await requestWithAuth('delete', `/saved-review-presets/${presetId}`).expect(204);
    await requestWithAuth('get', `/saved-review-presets/${presetId}`).expect(404);
  });

  it('rejects invalid payloads', async () => {
    const response = await requestWithAuth('post', '/saved-review-presets')
      .send({
        name: 99,
        scope: 'invalid_scope',
        config: [],
      })
      .expect(400);

    expect(response.body.message).toContain('name must be a string');
    expect(response.body.message).toContain('scope must be one of the following values: match_detail');
    expect(response.body.message).toContain('config must be an object');
  });

  it('rejects unknown payload fields and unknown config fields', async () => {
    const response = await requestWithAuth('post', '/saved-review-presets')
      .send({
        ...validPresetPayload,
        ownerId: 'coach-1',
        config: {
          ...validPresetPayload.config,
          includeArchived: true,
        },
      })
      .expect(400);

    expect(response.body.message).toContain('property ownerId should not exist');
    expect(response.body.message).toContain('config property includeArchived should not exist');
  });

  it('rejects preset config validation edge cases', async () => {
    const response = await requestWithAuth('post', '/saved-review-presets')
      .send({
        ...validPresetPayload,
        config: {
          eventTypeFilters: ['sweep', ' Sweep '],
          competitorFilter: 'C',
          positionFilters: ['standing', 'standing', 'invalid_position'],
          showOnlyValidationIssues: 'yes',
        },
      })
      .expect(400);

    expect(response.body.message).toContain('config.eventTypeFilters[1] must be unique');
    expect(response.body.message).toContain('config.competitorFilter must be one of the following values: A, B');
    expect(response.body.message).toContain('config.positionFilters[1] must be unique');
    expect(response.body.message).toContain(
      'config.positionFilters[2] must be one of the following values: standing, closed_guard, open_guard, half_guard, side_control, mount, back_control, north_south, leg_entanglement, scramble',
    );
    expect(response.body.message).toContain('config.showOnlyValidationIssues must be a boolean value');
  });

  it('rejects empty update payloads and unknown update fields', async () => {
    const createResponse = await requestWithAuth('post', '/saved-review-presets')
      .send(validPresetPayload)
      .expect(201);

    const presetId = createResponse.body.id as string;

    const emptyUpdateResponse = await requestWithAuth('patch', `/saved-review-presets/${presetId}`)
      .send({})
      .expect(400);

    expect(emptyUpdateResponse.body.message).toContain('At least one field must be provided for update');

    const unknownFieldResponse = await requestWithAuth('patch', `/saved-review-presets/${presetId}`)
      .send({ archived: true })
      .expect(400);

    expect(unknownFieldResponse.body.message).toContain('property archived should not exist');
  });

  it('returns not found for missing resources', async () => {
    await requestWithAuth('get', `/saved-review-presets/${missingPresetId}`).expect(404);
    await requestWithAuth('patch', `/saved-review-presets/${missingPresetId}`)
      .send({ name: 'Nope' })
      .expect(404);
    await requestWithAuth('delete', `/saved-review-presets/${missingPresetId}`).expect(404);
  });
});
