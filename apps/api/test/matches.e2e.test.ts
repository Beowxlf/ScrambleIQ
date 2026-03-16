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

  async function createMatch(): Promise<string> {
    const response = await request(app.getHttpServer()).post('/matches').send({
      title: 'State Finals',
      date: '2026-03-01',
      ruleset: 'Folkstyle',
      competitorA: 'Alex Carter',
      competitorB: 'Sam Jordan',
      notes: 'Quarterfinal match',
    }).expect(201);

    return response.body.id as string;
  }

  it('rejects invalid payloads with POST /matches', async () => {
    const response = await request(app.getHttpServer())
      .post('/matches')
      .send({ title: 10, date: '2026-03-01', ruleset: 'Folkstyle', competitorA: 'A', competitorB: 'B' })
      .expect(400);

    expect(response.body.message).toContain('title must be a string');
  });

  it('creates and fetches a match', async () => {
    const id = await createMatch();

    const response = await request(app.getHttpServer()).get(`/matches/${id}`).expect(200);

    expect(response.body.id).toBe(id);
    expect(response.body.title).toBe('State Finals');
  });

  it('updates and deletes a match', async () => {
    const id = await createMatch();

    await request(app.getHttpServer())
      .patch(`/matches/${id}`)
      .send({ title: 'Updated Finals' })
      .expect(200);

    await request(app.getHttpServer()).delete(`/matches/${id}`).expect(204);
    await request(app.getHttpServer()).get(`/matches/${id}`).expect(404);
  });

  it('creates an event with POST /matches/:id/events', async () => {
    const matchId = await createMatch();

    const response = await request(app.getHttpServer())
      .post(`/matches/${matchId}/events`)
      .send({ timestamp: 12, eventType: 'takedown_attempt', competitor: 'A', notes: 'Entry to single leg' })
      .expect(201);

    expect(response.body).toMatchObject({
      matchId,
      timestamp: 12,
      eventType: 'takedown_attempt',
      competitor: 'A',
      notes: 'Entry to single leg',
    });
    expect(response.body.id).toEqual(expect.any(String));
  });

  it('gets events sorted by timestamp with GET /matches/:id/events', async () => {
    const matchId = await createMatch();

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/events`)
      .send({ timestamp: 42, eventType: 'guard_pass', competitor: 'B' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/events`)
      .send({ timestamp: 12, eventType: 'takedown_attempt', competitor: 'A' })
      .expect(201);

    const response = await request(app.getHttpServer()).get(`/matches/${matchId}/events`).expect(200);

    expect(response.body.map((event: { timestamp: number }) => event.timestamp)).toEqual([12, 42]);
  });

  it('updates an event with PATCH /events/:id', async () => {
    const matchId = await createMatch();
    const createResponse = await request(app.getHttpServer())
      .post(`/matches/${matchId}/events`)
      .send({ timestamp: 18, eventType: 'takedown_completed', competitor: 'A' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .patch(`/events/${createResponse.body.id}`)
      .send({ timestamp: 20, competitor: 'B', notes: 'Countered to score' })
      .expect(200);

    expect(response.body).toMatchObject({
      id: createResponse.body.id,
      timestamp: 20,
      eventType: 'takedown_completed',
      competitor: 'B',
      notes: 'Countered to score',
    });
  });

  it('deletes an event with DELETE /events/:id', async () => {
    const matchId = await createMatch();
    const createResponse = await request(app.getHttpServer())
      .post(`/matches/${matchId}/events`)
      .send({ timestamp: 18, eventType: 'takedown_completed', competitor: 'A' })
      .expect(201);

    await request(app.getHttpServer()).delete(`/events/${createResponse.body.id}`).expect(204);

    const listResponse = await request(app.getHttpServer()).get(`/matches/${matchId}/events`).expect(200);
    expect(listResponse.body).toEqual([]);
  });

  it('rejects invalid event payloads', async () => {
    const matchId = await createMatch();

    const createResponse = await request(app.getHttpServer())
      .post(`/matches/${matchId}/events`)
      .send({ timestamp: -1, eventType: '', competitor: 'C', extraField: true })
      .expect(400);

    expect(createResponse.body.message).toContain('timestamp must not be less than 0');
    expect(createResponse.body.message).toContain('eventType should not be empty');
    expect(createResponse.body.message).toContain('competitor must be one of the following values: A, B');
    expect(createResponse.body.message).toContain('property extraField should not exist');
  });

  it('returns 404 behavior for missing match or event resources', async () => {
    await request(app.getHttpServer())
      .get('/matches/missing-match/events')
      .expect(404)
      .expect(({ body }: { body: { message: string } }) => {
        expect(body.message).toBe('Match with id missing-match was not found.');
      });

    await request(app.getHttpServer())
      .post('/matches/missing-match/events')
      .send({ timestamp: 12, eventType: 'takedown_attempt', competitor: 'A' })
      .expect(404)
      .expect(({ body }: { body: { message: string } }) => {
        expect(body.message).toBe('Match with id missing-match was not found.');
      });

    await request(app.getHttpServer())
      .patch('/events/missing-event')
      .send({ eventType: 'guard_pass' })
      .expect(404)
      .expect(({ body }: { body: { message: string } }) => {
        expect(body.message).toBe('Timeline event with id missing-event was not found.');
      });

    await request(app.getHttpServer())
      .delete('/events/missing-event')
      .expect(404)
      .expect(({ body }: { body: { message: string } }) => {
        expect(body.message).toBe('Timeline event with id missing-event was not found.');
      });
  });
});
