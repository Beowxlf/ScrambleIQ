import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('ReviewTemplatesController', () => {
  let app: INestApplication;
  const apiAuthToken = 'test-api-token';
  const missingTemplateId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

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

  const validTemplatePayload = {
    name: 'Competition Review Template',
    description: 'Used for post-match competition reviews.',
    scope: 'single_match_review',
    checklistItems: [
      {
        label: 'Opening sequence reviewed',
        description: 'Confirm the first exchange and initiative.',
        isRequired: true,
        sortOrder: 0,
      },
      {
        label: 'Endgame reviewed',
        isRequired: false,
        sortOrder: 1,
      },
    ],
  };

  it('creates, lists, gets, updates, and deletes review templates', async () => {
    const createResponse = await requestWithAuth('post', '/review-templates')
      .send(validTemplatePayload)
      .expect(201);

    expect(createResponse.body.id).toEqual(expect.any(String));
    expect(createResponse.body.checklistItemCount).toBe(2);
    expect(createResponse.body.checklistItems).toHaveLength(2);
    expect(createResponse.body.checklistItems[0].id).toEqual(expect.any(String));

    const templateId = createResponse.body.id as string;

    const listResponse = await requestWithAuth('get', '/review-templates').expect(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0]).toMatchObject({
      id: templateId,
      name: validTemplatePayload.name,
      scope: 'single_match_review',
      checklistItemCount: 2,
    });
    expect(listResponse.body[0].checklistItems).toBeUndefined();

    const getResponse = await requestWithAuth('get', `/review-templates/${templateId}`).expect(200);
    expect(getResponse.body).toMatchObject({
      id: templateId,
      name: validTemplatePayload.name,
      scope: 'single_match_review',
      checklistItemCount: 2,
    });
    expect(getResponse.body.checklistItems).toHaveLength(2);

    const updateResponse = await requestWithAuth('patch', `/review-templates/${templateId}`)
      .send({
        name: 'Updated Competition Template',
        checklistItems: [
          {
            label: 'Critical exchange reviewed',
            isRequired: true,
            sortOrder: 0,
          },
        ],
      })
      .expect(200);

    expect(updateResponse.body.name).toBe('Updated Competition Template');
    expect(updateResponse.body.checklistItemCount).toBe(1);
    expect(updateResponse.body.checklistItems).toHaveLength(1);

    await requestWithAuth('delete', `/review-templates/${templateId}`).expect(204);
    await requestWithAuth('get', `/review-templates/${templateId}`).expect(404);
  });

  it('rejects invalid payloads', async () => {
    const response = await requestWithAuth('post', '/review-templates')
      .send({
        name: 99,
        scope: 'invalid_scope',
        checklistItems: 'wrong-shape',
      })
      .expect(400);

    expect(response.body.message).toContain('name must be a string');
    expect(response.body.message).toContain('scope must be one of the following values: single_match_review');
    expect(response.body.message).toContain('checklistItems must be an array');
  });

  it('rejects unknown payload fields and unknown checklist item fields', async () => {
    const response = await requestWithAuth('post', '/review-templates')
      .send({
        ...validTemplatePayload,
        ownerId: 'coach-1',
        checklistItems: [
          {
            label: 'Opening sequence reviewed',
            isRequired: true,
            sortOrder: 0,
            extra: 'not-allowed',
          },
        ],
      })
      .expect(400);

    expect(response.body.message).toContain('property ownerId should not exist');
    expect(response.body.message).toContain('checklistItems[0] property extra should not exist');
  });

  it('rejects checklist edge cases', async () => {
    const response = await requestWithAuth('post', '/review-templates')
      .send({
        ...validTemplatePayload,
        checklistItems: [
          {
            label: '  ',
            isRequired: true,
            sortOrder: -1,
          },
          {
            label: 'duplicate label',
            isRequired: true,
            sortOrder: 0,
          },
          {
            label: 'Duplicate Label',
            isRequired: true,
            sortOrder: 0,
          },
        ],
      })
      .expect(400);

    expect(response.body.message).toContain('checklistItems[0].label should not be empty');
    expect(response.body.message).toContain('checklistItems[0].sortOrder must not be less than 0');
    expect(response.body.message).toContain('checklistItems[2].label must be unique');
    expect(response.body.message).toContain('checklistItems[2].sortOrder must be unique');
  });

  it('rejects empty update payloads and unknown update fields', async () => {
    const createResponse = await requestWithAuth('post', '/review-templates')
      .send(validTemplatePayload)
      .expect(201);

    const templateId = createResponse.body.id as string;

    const emptyUpdateResponse = await requestWithAuth('patch', `/review-templates/${templateId}`)
      .send({})
      .expect(400);

    expect(emptyUpdateResponse.body.message).toContain('At least one field must be provided for update');

    const unknownFieldResponse = await requestWithAuth('patch', `/review-templates/${templateId}`)
      .send({ archived: true })
      .expect(400);

    expect(unknownFieldResponse.body.message).toContain('property archived should not exist');
  });

  it('returns not found for missing resources', async () => {
    await requestWithAuth('get', `/review-templates/${missingTemplateId}`).expect(404);
    await requestWithAuth('patch', `/review-templates/${missingTemplateId}`)
      .send({ name: 'Nope' })
      .expect(404);
    await requestWithAuth('delete', `/review-templates/${missingTemplateId}`).expect(404);
  });
});
