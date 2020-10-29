import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { getConnection } from 'typeorm';
import { AppModule } from '../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // clear database
    await getConnection().synchronize(true);
  });

  afterAll(async () => {
    await app.close();
  });

  it('pong', () => {
    return request(app.getHttpServer()).get('/ping').expect(200).expect('pong');
  });
});
