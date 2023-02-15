import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { buildApp } from './utils';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  buildApp((_app) => (app = _app));

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect(
        '{"code":404,"msg":"Cannot GET /","data":{"statusCode":404,"message":"Cannot GET /","error":"Not Found"}}',
      );
  });
});
