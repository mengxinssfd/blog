import { buildApp } from './utils';

describe('AppController (e2e)', () => {
  const request = buildApp();

  it('/ (GET)', () => {
    return request().get('/').expect(200).expect('{"code":404,"msg":"Cannot GET /"}');
  });
});
