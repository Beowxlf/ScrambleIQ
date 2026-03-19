import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('MatchesController', () => {
  let app: INestApplication;
  const missingMatchId = '11111111-1111-4111-8111-111111111111';
  const missingEventId = '22222222-2222-4222-8222-222222222222';
  const missingPositionId = '33333333-3333-4333-8333-333333333333';

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

  async function createEvent(matchId: string, timestamp: number): Promise<void> {
    await request(app.getHttpServer())
      .post(`/matches/${matchId}/events`)
      .send({ timestamp, eventType: 'takedown_attempt', competitor: 'A' })
      .expect(201);
  }

  async function createPosition(matchId: string, timestampStart: number, timestampEnd: number): Promise<void> {
    await request(app.getHttpServer())
      .post(`/matches/${matchId}/positions`)
      .send({
        position: 'closed_guard',
        competitorTop: 'A',
        timestampStart,
        timestampEnd,
      })
      .expect(201);
  }

  async function createVideo(matchId: string): Promise<void> {
    await request(app.getHttpServer())
      .post(`/matches/${matchId}/video`)
      .send({
        title: 'Primary Camera',
        sourceType: 'remote_url',
        sourceUrl: 'https://example.com/video.mp4',
      })
      .expect(201);
  }

  it('rejects invalid payloads with POST /matches', async () => {
    const response = await request(app.getHttpServer())
      .post('/matches')
      .send({ title: 10, date: '2026-03-01', ruleset: 'Folkstyle', competitorA: 'A', competitorB: 'B' })
      .expect(400);

    expect(response.body.message).toContain('title must be a string');
  });

  it('rejects invalid match dates and unknown properties', async () => {
    const response = await request(app.getHttpServer())
      .post('/matches')
      .send({
        title: 'Bad Date',
        date: '2025-02-29',
        ruleset: 'Folkstyle',
        competitorA: 'A',
        competitorB: 'B',
        ownerId: 'attacker',
      })
      .expect(400);

    expect(response.body.message).toContain('date must be a valid date in YYYY-MM-DD format');
    expect(response.body.message).toContain('property ownerId should not exist');
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


  it('lists match summaries with deterministic sorting', async () => {
    const olderId = await createMatch();
    await request(app.getHttpServer()).patch(`/matches/${olderId}`).send({ date: '2026-02-01', title: 'Older' }).expect(200);
    const newerId = await createMatch();
    await request(app.getHttpServer()).patch(`/matches/${newerId}`).send({ date: '2026-03-05', title: 'Newer' }).expect(200);

    await createEvent(newerId, 5);
    await createEvent(newerId, 8);
    await createPosition(newerId, 10, 15);
    await createVideo(newerId);

    const response = await request(app.getHttpServer()).get('/matches').expect(200);

    expect(response.body.total).toBe(2);
    expect(response.body.matches).toHaveLength(2);
    expect(response.body.matches[0]).toMatchObject({
      matchId: newerId,
      title: 'Newer',
      eventDate: '2026-03-05',
      eventCount: 2,
      positionCount: 1,
      hasVideo: true,
    });
    expect(response.body.matches[1].matchId).toBe(olderId);
  });

  it('filters matches by competitor, date range, and hasVideo', async () => {
    const alphaId = await createMatch();
    await request(app.getHttpServer()).patch(`/matches/${alphaId}`).send({
      date: '2026-01-15',
      competitorA: 'Taylor One',
      competitorB: 'Jordan Two',
    }).expect(200);

    const betaId = await createMatch();
    await request(app.getHttpServer()).patch(`/matches/${betaId}`).send({
      date: '2026-02-20',
      competitorA: 'Casey Three',
      competitorB: 'Taylor Four',
    }).expect(200);
    await createVideo(betaId);

    const byCompetitor = await request(app.getHttpServer()).get('/matches?competitor=taylor').expect(200);
    expect(byCompetitor.body.total).toBe(2);

    const byDate = await request(app.getHttpServer()).get('/matches?dateFrom=2026-02-01&dateTo=2026-12-31').expect(200);
    expect(byDate.body.matches).toHaveLength(1);
    expect(byDate.body.matches[0].matchId).toBe(betaId);

    const byVideo = await request(app.getHttpServer()).get('/matches?hasVideo=true').expect(200);
    expect(byVideo.body.matches).toHaveLength(1);
    expect(byVideo.body.matches[0].matchId).toBe(betaId);
  });

  it('supports pagination via limit and offset', async () => {
    const firstId = await createMatch();
    await request(app.getHttpServer()).patch(`/matches/${firstId}`).send({ date: '2026-01-01', title: 'First' }).expect(200);
    const secondId = await createMatch();
    await request(app.getHttpServer()).patch(`/matches/${secondId}`).send({ date: '2026-01-02', title: 'Second' }).expect(200);
    const thirdId = await createMatch();
    await request(app.getHttpServer()).patch(`/matches/${thirdId}`).send({ date: '2026-01-03', title: 'Third' }).expect(200);

    const response = await request(app.getHttpServer()).get('/matches?limit=1&offset=1').expect(200);

    expect(response.body.total).toBe(3);
    expect(response.body.limit).toBe(1);
    expect(response.body.offset).toBe(1);
    expect(response.body.matches).toHaveLength(1);
    expect(response.body.matches[0].matchId).toBe(secondId);
  });

  it('rejects unknown and invalid list query parameters', async () => {
    const response = await request(app.getHttpServer())
      .get('/matches?hasVideo=maybe&limit=0&foo=bar&dateFrom=2026-13-01')
      .expect(400);

    expect(response.body.message).toContain('hasVideo must be one of the following values: true, false');
    expect(response.body.message).toContain('limit must not be less than 1');
    expect(response.body.message).toContain('property foo should not exist');
    expect(response.body.message).toContain('dateFrom must be a valid date in YYYY-MM-DD format');
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
      .get(`/matches/${missingMatchId}/events`)
      .expect(404)
      .expect(({ body }: { body: { message: string } }) => {
        expect(body.message).toBe(`Match with id ${missingMatchId} was not found.`);
      });

    await request(app.getHttpServer())
      .post(`/matches/${missingMatchId}/events`)
      .send({ timestamp: 12, eventType: 'takedown_attempt', competitor: 'A' })
      .expect(404)
      .expect(({ body }: { body: { message: string } }) => {
        expect(body.message).toBe(`Match with id ${missingMatchId} was not found.`);
      });

    await request(app.getHttpServer())
      .patch(`/events/${missingEventId}`)
      .send({ eventType: 'guard_pass' })
      .expect(404)
      .expect(({ body }: { body: { message: string } }) => {
        expect(body.message).toBe(`Timeline event with id ${missingEventId} was not found.`);
      });

    await request(app.getHttpServer())
      .delete(`/events/${missingEventId}`)
      .expect(404)
      .expect(({ body }: { body: { message: string } }) => {
        expect(body.message).toBe(`Timeline event with id ${missingEventId} was not found.`);
      });
  });

  it('rejects invalid route ids before hitting services', async () => {
    const response = await request(app.getHttpServer()).get('/matches/not-a-uuid').expect(400);
    expect(response.body.message).toContain('Validation failed (uuid is expected)');

    await request(app.getHttpServer()).patch('/events/not-a-uuid').send({ eventType: 'sweep' }).expect(400);
    await request(app.getHttpServer()).patch('/positions/not-a-uuid').send({ position: 'mount' }).expect(400);
    await request(app.getHttpServer()).patch('/video/not-a-uuid').send({ title: 'Angle B' }).expect(400);
    await request(app.getHttpServer()).get('/matches/not-a-uuid/events').expect(400);
    await request(app.getHttpServer()).get('/matches/not-a-uuid/positions').expect(400);
    await request(app.getHttpServer()).get('/matches/not-a-uuid/video').expect(400);
  });

  it('creates a position with POST /matches/:id/positions', async () => {
    const matchId = await createMatch();

    const response = await request(app.getHttpServer())
      .post(`/matches/${matchId}/positions`)
      .send({
        position: 'closed_guard',
        competitorTop: 'A',
        timestampStart: 12,
        timestampEnd: 22,
        notes: 'Established closed guard',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      matchId,
      position: 'closed_guard',
      competitorTop: 'A',
      timestampStart: 12,
      timestampEnd: 22,
      notes: 'Established closed guard',
    });
    expect(response.body.id).toEqual(expect.any(String));
  });

  it('gets positions sorted by timestampStart with GET /matches/:id/positions', async () => {
    const matchId = await createMatch();

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/positions`)
      .send({ position: 'mount', competitorTop: 'B', timestampStart: 40, timestampEnd: 55 })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/positions`)
      .send({ position: 'closed_guard', competitorTop: 'A', timestampStart: 12, timestampEnd: 20 })
      .expect(201);

    const response = await request(app.getHttpServer()).get(`/matches/${matchId}/positions`).expect(200);

    expect(response.body.map((position: { timestampStart: number }) => position.timestampStart)).toEqual([12, 40]);
  });

  it('updates a position with PATCH /positions/:id', async () => {
    const matchId = await createMatch();
    const createResponse = await request(app.getHttpServer())
      .post(`/matches/${matchId}/positions`)
      .send({ position: 'closed_guard', competitorTop: 'A', timestampStart: 12, timestampEnd: 20 })
      .expect(201);

    const response = await request(app.getHttpServer())
      .patch(`/positions/${createResponse.body.id}`)
      .send({ position: 'mount', competitorTop: 'B', timestampEnd: 26, notes: 'Transitioned to mount' })
      .expect(200);

    expect(response.body).toMatchObject({
      id: createResponse.body.id,
      position: 'mount',
      competitorTop: 'B',
      timestampStart: 12,
      timestampEnd: 26,
      notes: 'Transitioned to mount',
    });
  });

  it('deletes a position with DELETE /positions/:id', async () => {
    const matchId = await createMatch();
    const createResponse = await request(app.getHttpServer())
      .post(`/matches/${matchId}/positions`)
      .send({ position: 'closed_guard', competitorTop: 'A', timestampStart: 12, timestampEnd: 20 })
      .expect(201);

    await request(app.getHttpServer()).delete(`/positions/${createResponse.body.id}`).expect(204);

    const listResponse = await request(app.getHttpServer()).get(`/matches/${matchId}/positions`).expect(200);
    expect(listResponse.body).toEqual([]);
  });


  it('removes positions when parent match is deleted', async () => {
    const matchId = await createMatch();

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/positions`)
      .send({ position: 'closed_guard', competitorTop: 'A', timestampStart: 12, timestampEnd: 20 })
      .expect(201);

    await request(app.getHttpServer()).delete(`/matches/${matchId}`).expect(204);
    await request(app.getHttpServer()).get(`/matches/${matchId}/positions`).expect(404);
  });

  it('rejects invalid position payloads', async () => {
    const matchId = await createMatch();

    const createResponse = await request(app.getHttpServer())
      .post(`/matches/${matchId}/positions`)
      .send({ position: 'unknown', competitorTop: 'C', timestampStart: -1, timestampEnd: -1, extraField: true })
      .expect(400);

    expect(createResponse.body.message).toContain('position must be one of the following values: standing, closed_guard, open_guard, half_guard, side_control, mount, back_control, north_south, leg_entanglement, scramble');
    expect(createResponse.body.message).toContain('competitorTop must be one of the following values: A, B');
    expect(createResponse.body.message).toContain('timestampStart must not be less than 0');
    expect(createResponse.body.message).toContain('timestampEnd must be greater than timestampStart');
    expect(createResponse.body.message).toContain('property extraField should not exist');
  });

  it('returns 404 behavior for missing position resources', async () => {
    await request(app.getHttpServer())
      .get(`/matches/${missingMatchId}/positions`)
      .expect(404)
      .expect(({ body }: { body: { message: string } }) => {
        expect(body.message).toBe(`Match with id ${missingMatchId} was not found.`);
      });

    await request(app.getHttpServer())
      .post(`/matches/${missingMatchId}/positions`)
      .send({ position: 'closed_guard', competitorTop: 'A', timestampStart: 12, timestampEnd: 20 })
      .expect(404)
      .expect(({ body }: { body: { message: string } }) => {
        expect(body.message).toBe(`Match with id ${missingMatchId} was not found.`);
      });

    await request(app.getHttpServer())
      .patch(`/positions/${missingPositionId}`)
      .send({ position: 'mount' })
      .expect(404)
      .expect(({ body }: { body: { message: string } }) => {
        expect(body.message).toBe(`Position state with id ${missingPositionId} was not found.`);
      });

    await request(app.getHttpServer())
      .delete(`/positions/${missingPositionId}`)
      .expect(404)
      .expect(({ body }: { body: { message: string } }) => {
        expect(body.message).toBe(`Position state with id ${missingPositionId} was not found.`);
      });
  });


  it('creates and gets a match video', async () => {
    const matchId = await createMatch();

    const createResponse = await request(app.getHttpServer())
      .post(`/matches/${matchId}/video`)
      .send({
        title: 'Finals angle',
        sourceType: 'remote_url',
        sourceUrl: 'https://cdn.example.com/video.mp4',
        durationSeconds: 360,
        notes: 'Primary camera',
      })
      .expect(201);

    expect(createResponse.body.matchId).toBe(matchId);

    const getResponse = await request(app.getHttpServer()).get(`/matches/${matchId}/video`).expect(200);
    expect(getResponse.body.id).toBe(createResponse.body.id);
  });

  it('updates and deletes a match video', async () => {
    const matchId = await createMatch();

    const createResponse = await request(app.getHttpServer())
      .post(`/matches/${matchId}/video`)
      .send({ title: 'Angle A', sourceType: 'remote_url', sourceUrl: 'https://cdn.example.com/a.mp4' })
      .expect(201);

    const updateResponse = await request(app.getHttpServer())
      .patch(`/video/${createResponse.body.id}`)
      .send({ title: 'Angle B', sourceType: 'local_demo', notes: 'Updated metadata' })
      .expect(200);

    expect(updateResponse.body).toMatchObject({
      id: createResponse.body.id,
      title: 'Angle B',
      sourceType: 'local_demo',
      notes: 'Updated metadata',
    });

    await request(app.getHttpServer()).delete(`/video/${createResponse.body.id}`).expect(204);
    await request(app.getHttpServer()).patch(`/video/${createResponse.body.id}`).send({ title: 'Nope' }).expect(404);
  });

  it('returns 404 for unknown match and video IDs for video endpoints', async () => {
    await request(app.getHttpServer())
      .post(`/matches/${missingMatchId}/video`)
      .send({ title: 'Angle', sourceType: 'remote_url', sourceUrl: 'https://cdn.example.com/a.mp4' })
      .expect(404);

    await request(app.getHttpServer()).get(`/matches/${missingMatchId}/video`).expect(404);

    await request(app.getHttpServer())
      .patch(`/video/44444444-4444-4444-8444-444444444444`)
      .send({ title: 'Angle B' })
      .expect(404);
  });

  it('rejects invalid match video payloads', async () => {
    const matchId = await createMatch();

    const response = await request(app.getHttpServer())
      .post(`/matches/${matchId}/video`)
      .send({ title: '', sourceType: 'bad', sourceUrl: '', unknown: true })
      .expect(400);

    expect(response.body.message).toContain('title should not be empty');
    expect(response.body.message).toContain('sourceType must be one of the following values: remote_url, local_demo');
    expect(response.body.message).toContain('sourceUrl should not be empty');
    expect(response.body.message).toContain('property unknown should not exist');
  });

  it('removes attached video when parent match is deleted', async () => {
    const matchId = await createMatch();

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/video`)
      .send({ title: 'Angle', sourceType: 'remote_url', sourceUrl: 'https://cdn.example.com/a.mp4' })
      .expect(201);

    await request(app.getHttpServer()).delete(`/matches/${matchId}`).expect(204);
    await request(app.getHttpServer()).get(`/matches/${matchId}/video`).expect(404);
  });
  it('rejects overlapping position segments', async () => {
    const matchId = await createMatch();

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/positions`)
      .send({ position: 'closed_guard', competitorTop: 'A', timestampStart: 10, timestampEnd: 20 })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post(`/matches/${matchId}/positions`)
      .send({ position: 'mount', competitorTop: 'B', timestampStart: 15, timestampEnd: 25 })
      .expect(400);

    expect(response.body.message).toContain('Position state timestamps must not overlap existing segments');
  });

  it('returns analytics for a valid match', async () => {
    const matchId = await createMatch();

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/events`)
      .send({ timestamp: 5, eventType: 'takedown_attempt', competitor: 'A' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/events`)
      .send({ timestamp: 15, eventType: 'takedown_attempt', competitor: 'B' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/events`)
      .send({ timestamp: 25, eventType: 'guard_pass', competitor: 'A' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/positions`)
      .send({ position: 'closed_guard', competitorTop: 'A', timestampStart: 10, timestampEnd: 20 })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/positions`)
      .send({ position: 'mount', competitorTop: 'A', timestampStart: 20, timestampEnd: 28 })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/positions`)
      .send({ position: 'mount', competitorTop: 'B', timestampStart: 28, timestampEnd: 33 })
      .expect(201);

    const response = await request(app.getHttpServer()).get(`/matches/${matchId}/analytics`).expect(200);

    expect(response.body.matchId).toBe(matchId);
    expect(response.body.totalEventCount).toBe(3);
    expect(response.body.eventCountsByType).toEqual({
      takedown_attempt: 2,
      guard_pass: 1,
    });
    expect(response.body.totalPositionCount).toBe(3);
    expect(response.body.totalTrackedPositionTimeSeconds).toBe(23);
    expect(response.body.timeInPositionByTypeSeconds.closed_guard).toBe(10);
    expect(response.body.timeInPositionByTypeSeconds.mount).toBe(13);
    expect(response.body.competitorTopTimeByPositionSeconds.A.mount).toBe(8);
    expect(response.body.competitorTopTimeByPositionSeconds.B.mount).toBe(5);
  });

  it('recomputes analytics totals after event and position updates and deletions', async () => {
    const matchId = await createMatch();

    const createdEvent = await request(app.getHttpServer())
      .post(`/matches/${matchId}/events`)
      .send({ timestamp: 5, eventType: 'takedown_attempt', competitor: 'A' })
      .expect(201);

    const createdPosition = await request(app.getHttpServer())
      .post(`/matches/${matchId}/positions`)
      .send({ position: 'standing', competitorTop: 'A', timestampStart: 0, timestampEnd: 10 })
      .expect(201);

    const baselineAnalytics = await request(app.getHttpServer()).get(`/matches/${matchId}/analytics`).expect(200);
    expect(baselineAnalytics.body.totalEventCount).toBe(1);
    expect(baselineAnalytics.body.totalPositionCount).toBe(1);
    expect(baselineAnalytics.body.totalTrackedPositionTimeSeconds).toBe(10);
    expect(baselineAnalytics.body.timeInPositionByTypeSeconds.standing).toBe(10);

    await request(app.getHttpServer())
      .patch(`/events/${createdEvent.body.id}`)
      .send({ eventType: 'guard_pass' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/positions/${createdPosition.body.id}`)
      .send({ position: 'mount', timestampStart: 2, timestampEnd: 14 })
      .expect(200);

    const updatedAnalytics = await request(app.getHttpServer()).get(`/matches/${matchId}/analytics`).expect(200);
    expect(updatedAnalytics.body.totalEventCount).toBe(1);
    expect(updatedAnalytics.body.eventCountsByType).toEqual({ guard_pass: 1 });
    expect(updatedAnalytics.body.totalPositionCount).toBe(1);
    expect(updatedAnalytics.body.timeInPositionByTypeSeconds.standing).toBe(0);
    expect(updatedAnalytics.body.timeInPositionByTypeSeconds.mount).toBe(12);
    expect(updatedAnalytics.body.totalTrackedPositionTimeSeconds).toBe(12);

    await request(app.getHttpServer()).delete(`/events/${createdEvent.body.id}`).expect(204);
    await request(app.getHttpServer()).delete(`/positions/${createdPosition.body.id}`).expect(204);

    const afterDeletionAnalytics = await request(app.getHttpServer()).get(`/matches/${matchId}/analytics`).expect(200);
    expect(afterDeletionAnalytics.body.totalEventCount).toBe(0);
    expect(afterDeletionAnalytics.body.eventCountsByType).toEqual({});
    expect(afterDeletionAnalytics.body.totalPositionCount).toBe(0);
    expect(afterDeletionAnalytics.body.totalTrackedPositionTimeSeconds).toBe(0);
    expect(afterDeletionAnalytics.body.timeInPositionByTypeSeconds.mount).toBe(0);
  });


  it('returns structured match dataset export', async () => {
    const matchId = await createMatch();

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/video`)
      .send({ title: 'Main camera', sourceType: 'remote_url', sourceUrl: 'https://cdn.example.com/match.mp4' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/events`)
      .send({ timestamp: 30, eventType: 'guard_pass', competitor: 'B' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/events`)
      .send({ timestamp: 10, eventType: 'takedown_attempt', competitor: 'A' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/positions`)
      .send({ position: 'half_guard', competitorTop: 'A', timestampStart: 20, timestampEnd: 30 })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/positions`)
      .send({ position: 'standing', competitorTop: 'A', timestampStart: 0, timestampEnd: 20 })
      .expect(201);

    const response = await request(app.getHttpServer()).get(`/matches/${matchId}/export`).expect(200);

    expect(response.body.match.id).toBe(matchId);
    expect(response.body.video).toMatchObject({
      matchId,
      title: 'Main camera',
      sourceType: 'remote_url',
      sourceUrl: 'https://cdn.example.com/match.mp4',
    });
    expect(response.body.analytics.matchId).toBe(matchId);
    expect(response.body.events.map((event: { timestamp: number }) => event.timestamp)).toEqual([10, 30]);
    expect(response.body.positions.map((position: { timestampStart: number }) => position.timestampStart)).toEqual([0, 20]);
  });

  it('returns 404 for export of an unknown match', async () => {
    await request(app.getHttpServer())
      .get(`/matches/${missingMatchId}/export`)
      .expect(404)
      .expect(({ body }: { body: { message: string } }) => {
        expect(body.message).toBe(`Match with id ${missingMatchId} was not found.`);
      });
  });


  it('returns a dataset validation report for a match', async () => {
    const matchId = await createMatch();

    await request(app.getHttpServer())
      .post(`/matches/${matchId}/events`)
      .send({ timestamp: 12, eventType: 'takedown_attempt', competitor: 'A' })
      .expect(201);

    const response = await request(app.getHttpServer()).get(`/matches/${matchId}/validate`).expect(200);

    expect(response.body.matchId).toBe(matchId);
    expect(response.body.issueCount).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(response.body.issues)).toBe(true);
  });

  it('returns 404 for validation of an unknown match', async () => {
    await request(app.getHttpServer())
      .get(`/matches/${missingMatchId}/validate`)
      .expect(404)
      .expect(({ body }: { body: { message: string } }) => {
        expect(body.message).toBe(`Match with id ${missingMatchId} was not found.`);
      });
  });

  it('returns 404 for analytics of an unknown match', async () => {
    await request(app.getHttpServer())
      .get(`/matches/${missingMatchId}/analytics`)
      .expect(404)
      .expect(({ body }: { body: { message: string } }) => {
        expect(body.message).toBe(`Match with id ${missingMatchId} was not found.`);
      });
  });

});
