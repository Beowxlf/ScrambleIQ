import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { afterAll, beforeAll, describe, it } from 'vitest';

describe('AppController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.API_AUTH_TOKEN = 'test-api-token';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    delete process.env.API_AUTH_TOKEN;
    await app.close();
  });

  it('returns health status', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok', service: 'scrambleiq-api' });
  });

  it('rejects unauthenticated access to protected routes', async () => {
    await request(app.getHttpServer()).get('/matches').expect(401);
  });
});
