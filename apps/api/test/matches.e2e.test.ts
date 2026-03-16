import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';

describe('MatchesController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
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

    const response = await request(app.getHttpServer())
      .post('/matches')
      .send(payload)
      .expect(201);

    expect(response.body).toMatchObject(payload);
    expect(response.body.id).toEqual(expect.any(String));
  });

  it('returns matches with GET /matches', async () => {
    const payload = {
      title: 'Open Invitational',
      date: '2026-03-02',
      ruleset: 'Freestyle',
      competitorA: 'Jordan Lee',
      competitorB: 'Chris Vale',
      notes: 'Semifinal match',
    };

    await request(app.getHttpServer()).post('/matches').send(payload).expect(201);

    const response = await request(app.getHttpServer()).get('/matches').expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject(payload);
    expect(response.body[0].id).toEqual(expect.any(String));
  });
});
