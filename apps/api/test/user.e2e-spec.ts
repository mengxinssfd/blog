import { buildApp } from './utils';
import { UserEntity } from '@blog/entities';
import { idGen } from '@tool-pack/basic';

describe('UserController (e2e): /api/user', () => {
  const request = buildApp(async () => {
    await UserEntity.clear();
  });

  const prefix = '/api/user';
  it('/ (GET)', () => {
    return request().get(prefix).expect(200).expect('{"code":401,"msg":"Unauthorized"}');
  });
  it('/self (GET)', () => {
    return request()
      .get(prefix + '/self')
      .expect(200)
      .expect('{"code":401,"msg":"Unauthorized"}');
  });

  describe('/register (POST)', () => {
    const id = idGen();
    function buildData() {
      const name = 'hello_' + id.next().value;
      return {
        username: name,
        password: '123456',
        rePassword: '123456',
        nickname: name,
        mobile: '',
      };
    }
    for (let i = 0; i < 5; i++) {
      it('should success', () => {
        return request()
          .post(prefix + '/register')
          .send(buildData())
          .expect(201)
          .expect('{"code":200,"msg":"Success"}');
      });
    }
    it('创建账号太多', () => {
      return request()
        .post(prefix + '/register')
        .send(buildData())
        .expect(200)
        .expect('{"code":403,"msg":"创建账号太多"}');
    });
  });
});
