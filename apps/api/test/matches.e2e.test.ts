import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('MatchesController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('rejects invalid payloads with POST /matches', async () => {
    const response = await request(app.getHttpServer())
      .post('/matches')
      .send({ title: 10, date: '2026-03-01', ruleset: 'Folkstyle', competitorA: 'A', competitorB: 'B' })
      .expect(400);

    expect(response.body.message).toContain('title must be a string');
  });

  it('rejects missing required fields with POST /matches', async () => {
    const response = await request(app.getHttpServer())
      .post('/matches')
      .send({ date: '2026-03-01', ruleset: 'Folkstyle', competitorA: 'A', competitorB: 'B' })
      .expect(400);

    expect(response.body.message).toContain('title should not be empty');
    expect(response.body.message).toContain('title must be a string');
  });

  it('creates a match with POST /matches', async () => {
    const payload = {
      title: 'State Finals',
      date: '2026-03-01',
      ruleset: 'Folkstyle',
      competitorA: 'Alex Carter',
      competitorB: 'Sam Jordan',
      notes: 'Quarterfinal match',
    };

    const response = await request(app.getHttpServer()).post('/matches').send(payload).expect(201);

    expect(response.body).toMatchObject(payload);
    expect(response.body.id).toEqual(expect.any(String));
  });

  it('returns matches ordered newest date first with GET /matches', async () => {
    await request(app.getHttpServer()).post('/matches').send({
      title: 'Oldest',
      date: '2026-03-01',
      ruleset: 'Folkstyle',
      competitorA: 'A',
      competitorB: 'B',
    });

    await request(app.getHttpServer()).post('/matches').send({
      title: 'Newest',
      date: '2026-03-03',
      ruleset: 'Folkstyle',
      competitorA: 'C',
      competitorB: 'D',
    });

    await request(app.getHttpServer()).post('/matches').send({
      title: 'Middle',
      date: '2026-03-02',
      ruleset: 'Folkstyle',
      competitorA: 'E',
      competitorB: 'F',
    });

    const response = await request(app.getHttpServer()).get('/matches').expect(200);

    expect(response.body.map((match: { title: string }) => match.title)).toEqual(['Newest', 'Middle', 'Oldest']);
  });

  it('returns a match by id with GET /matches/:id', async () => {
    const payload = {
      title: 'Regional Championship',
      date: '2026-03-15',
      ruleset: 'Submission Grappling',
      competitorA: 'Taylor Brooks',
      competitorB: 'Morgan Diaz',
      notes: 'Final round',
    };

    const createResponse = await request(app.getHttpServer()).post('/matches').send(payload).expect(201);

    const response = await request(app.getHttpServer()).get(`/matches/${createResponse.body.id}`).expect(200);

    expect(response.body).toEqual(createResponse.body);
  });


  it('updates a match with PATCH /matches/:id', async () => {
    const createResponse = await request(app.getHttpServer()).post('/matches').send({
      title: 'Original Title',
      date: '2026-03-01',
      ruleset: 'Folkstyle',
      competitorA: 'Alex Carter',
      competitorB: 'Sam Jordan',
      notes: 'Original notes',
    }).expect(201);

    const response = await request(app.getHttpServer())
      .patch(`/matches/${createResponse.body.id}`)
      .send({
        title: 'Updated Title',
        date: '2026-03-02',
        ruleset: 'No-Gi',
        competitorA: 'Alex Carter',
        competitorB: 'Sam Jordan',
        notes: 'Updated notes',
      })
      .expect(200);

    expect(response.body).toMatchObject({
      id: createResponse.body.id,
      title: 'Updated Title',
      date: '2026-03-02',
      ruleset: 'No-Gi',
      competitorA: 'Alex Carter',
      competitorB: 'Sam Jordan',
      notes: 'Updated notes',
    });
  });

  it('partially updates a match with PATCH /matches/:id', async () => {
    const createResponse = await request(app.getHttpServer()).post('/matches').send({
      title: 'Original Title',
      date: '2026-03-01',
      ruleset: 'Folkstyle',
      competitorA: 'Alex Carter',
      competitorB: 'Sam Jordan',
      notes: 'Original notes',
    }).expect(201);

    const response = await request(app.getHttpServer())
      .patch(`/matches/${createResponse.body.id}`)
      .send({
        title: 'Updated Title',
      })
      .expect(200);

    expect(response.body).toMatchObject({
      id: createResponse.body.id,
      title: 'Updated Title',
      date: '2026-03-01',
      ruleset: 'Folkstyle',
      competitorA: 'Alex Carter',
      competitorB: 'Sam Jordan',
      notes: 'Original notes',
    });
  });

  it('rejects invalid payloads with PATCH /matches/:id', async () => {
    const createResponse = await request(app.getHttpServer()).post('/matches').send({
      title: 'Original Title',
      date: '2026-03-01',
      ruleset: 'Folkstyle',
      competitorA: 'Alex Carter',
      competitorB: 'Sam Jordan',
      notes: 'Original notes',
    }).expect(201);

    const response = await request(app.getHttpServer())
      .patch(`/matches/${createResponse.body.id}`)
      .send({ title: '', date: 'not-a-date' })
      .expect(400);

    expect(response.body.message).toContain('title should not be empty');
    expect(response.body.message).toContain('date must be a valid date');
  });

  it('returns 404 for PATCH /matches/:id when id does not exist', async () => {
    const response = await request(app.getHttpServer())
      .patch('/matches/non-existent-id')
      .send({ title: 'Updated title' })
      .expect(404);

    expect(response.body.message).toBe('Match with id non-existent-id was not found.');
  });

  it('returns 404 for an unknown id with GET /matches/:id', async () => {
    const response = await request(app.getHttpServer()).get('/matches/non-existent-id').expect(404);

    expect(response.body.message).toBe('Match with id non-existent-id was not found.');
  });

  it('deletes a match with DELETE /matches/:id', async () => {
    const createResponse = await request(app.getHttpServer()).post('/matches').send({
      title: 'Delete Me',
      date: '2026-03-04',
      ruleset: 'Folkstyle',
      competitorA: 'Alex Carter',
      competitorB: 'Sam Jordan',
      notes: 'To be deleted',
    }).expect(201);

    await request(app.getHttpServer()).delete(`/matches/${createResponse.body.id}`).expect(204);
  });

  it('returns 404 for DELETE /matches/:id when id does not exist', async () => {
    const response = await request(app.getHttpServer()).delete('/matches/non-existent-id').expect(404);

    expect(response.body.message).toBe('Match with id non-existent-id was not found.');
  });

  it('does not return deleted matches in GET /matches', async () => {
    const createResponse = await request(app.getHttpServer()).post('/matches').send({
      title: 'Delete from list',
      date: '2026-03-05',
      ruleset: 'Folkstyle',
      competitorA: 'Alex Carter',
      competitorB: 'Sam Jordan',
      notes: '',
    }).expect(201);

    await request(app.getHttpServer()).delete(`/matches/${createResponse.body.id}`).expect(204);

    const listResponse = await request(app.getHttpServer()).get('/matches').expect(200);

    expect(listResponse.body.some((match: { id: string }) => match.id === createResponse.body.id)).toBe(false);
  });

  it('does not return deleted matches in GET /matches/:id', async () => {
    const createResponse = await request(app.getHttpServer()).post('/matches').send({
      title: 'Delete from detail',
      date: '2026-03-06',
      ruleset: 'Folkstyle',
      competitorA: 'Alex Carter',
      competitorB: 'Sam Jordan',
      notes: '',
    }).expect(201);

    await request(app.getHttpServer()).delete(`/matches/${createResponse.body.id}`).expect(204);

    const detailResponse = await request(app.getHttpServer()).get(`/matches/${createResponse.body.id}`).expect(404);

    expect(detailResponse.body.message).toBe(`Match with id ${createResponse.body.id} was not found.`);
  });
});
