import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import * as request from 'supertest';
import { SuperTest } from 'supertest';
import { iniApp } from '@/init-app';
import { sleep } from '@tool-pack/basic';

export function buildApp(cb?: (app: INestApplication) => void): () => SuperTest<request.Test> {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    iniApp(app);
    await app.init();

    await cb?.(app);
  });

  // 不加会报错
  afterAll(() => sleep(5));

  return () => request(app.getHttpServer());
}
