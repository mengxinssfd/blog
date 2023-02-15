import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { buildApp } from './utils';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  buildApp((_app) => (app = _app));

  const prefix = '/api/user';
  it(prefix + ' (GET)', () => {
    return request(app.getHttpServer())
      .get(prefix)
      .expect(200)
      .expect('{"code":401,"msg":"Unauthorized"}');
  });
  it(prefix + '/self (GET)', () => {
    return request(app.getHttpServer())
      .get(prefix + '/self')
      .expect(200)
      .expect('{"code":401,"msg":"Unauthorized"}');
  });
});
