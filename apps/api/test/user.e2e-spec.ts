import { buildApp } from './utils';
import { UserEntity } from '@blog/entities';
import { idGen, pick } from '@tool-pack/basic';

describe('UserController (e2e): /api/user', () => {
  const request = buildApp(async () => {
    await UserEntity.clear();
  });

  const prefix = '/api/user';
  it('/ (GET)', () => {
    return request().get(prefix).expect(200).expect('{"code":401,"msg":"Unauthorized"}');
  });

  const id = idGen();
  function buildRegisterData() {
    const name = 'hello_' + id.next().value;
    return {
      username: name,
      password: '123456',
      rePassword: '123456',
      nickname: name,
      mobile: '',
    };
  }
  describe('/register (POST)', () => {
    for (let i = 0; i < 5; i++) {
      it('should success', () => {
        return request()
          .post(prefix + '/register')
          .send(buildRegisterData())
          .expect(201)
          .expect('{"code":200,"msg":"Success"}');
      });
    }
    it('创建账号太多', () => {
      return request()
        .post(prefix + '/register')
        .send(buildRegisterData())
        .expect(200)
        .expect('{"code":403,"msg":"创建账号太多"}');
    });
  });
  describe('/login (POST)', () => {
    it('账号不存在', async () => {
      await UserEntity.clear();
      return request()
        .post(prefix + '/login')
        .send(pick(buildRegisterData(), ['username', 'password']))
        .expect(200)
        .expect('{"code":401,"msg":"账号不存在"}');
    });
    it('账号或密码不正确', async function () {
      const user = buildRegisterData();
      await request()
        .post(prefix + '/register')
        .send(user);

      return request()
        .post(prefix + '/login')
        .send({ username: user.username, password: '123' })
        .expect(200)
        .expect('{"code":401,"msg":"账号或密码不正确"}');
    });
    it('登录成功', async function () {
      const user = buildRegisterData();
      await request()
        .post(prefix + '/register')
        .send(user);

      return request()
        .post(prefix + '/login')
        .send(pick(user, ['password', 'username']))
        .expect(200)
        .then((res) => {
          const body = { ...res.body };
          const data = body.data;
          delete body.data;
          // '{"code":207,"msg":"success","data":{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6MywiaWF0IjoxNjc2NDc1OTc0LCJleHAiOjE2NzY1NjIzNzR9.hY6_2d2gAi4qT4V_R9zUWxREEQg6M7j_eY-NtffywQg"}}'
          expect(body).toEqual({ code: 207, msg: 'Success' });
          expect(typeof data.token).toBe('string');
          expect(data.token.length).toBe(149);
        });
    });
  });
  describe('/self (GET)获取个人信息', () => {
    it('未登录，获取失败', () => {
      return request()
        .get(prefix + '/self')
        .expect(200)
        .expect('{"code":401,"msg":"Unauthorized"}');
    });
    it('获取成功', async function () {
      await UserEntity.clear();
      const user = buildRegisterData();
      await request()
        .post(prefix + '/register')
        .send(user);

      const {
        body: {
          data: { token },
        },
      } = await request()
        .post(prefix + '/login')
        .send(pick(user, ['password', 'username']));

      expect(typeof token).toBe('string');

      return request()
        .get(prefix + '/self')
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .then((res) => {
          // {
          //   code: 200,
          //   msg: 'Success',
          //   data: {
          //     user: {
          //       id: 1,
          //       username: 'hello_9',
          //       nickname: 'hello_9',
          //       avatar:
          //         'https://my-blog-store.oss-cn-guangzhou.aliyuncs.com/store/20201103002944_c9ed4.jpeg',
          //       role: 0,
          //     },
          //   },
          // };
          const body = { ...res.body };
          const data = body.data;
          delete body.data;
          expect(body).toEqual({ code: 200, msg: 'Success' });
          expect(data.user).not.toBeUndefined();
          expect(data.user.username).toBe(user.username);
          expect(data.user.nickname).toBe(user.nickname);
          expect(data.user.avatar).toBe(
            'https://my-blog-store.oss-cn-guangzhou.aliyuncs.com/store/20201103002944_c9ed4.jpeg',
          );
          expect(Object.keys(data.user).sort()).toEqual([
            'avatar',
            'id',
            'nickname',
            'role',
            'username',
          ]);
        });
    });
  });
});
