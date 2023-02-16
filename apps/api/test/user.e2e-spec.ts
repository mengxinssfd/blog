import { buildApp } from './utils';
import { UserEntity } from '@blog/entities';
import { idGen, pick } from '@tool-pack/basic';

// 常用的返回类型
const ResTypes = {
  success: '{"code":200,"msg":"Success"}',
  unauthorized: '{"code":401,"msg":"Unauthorized"}',
  register: /^\{"code":200,"msg":"Success","data":\{"id":\d+}}$/,
  login: /^\{"code":207,"msg":"Success","data":\{"token":"[^"]{149}"}}$/,
  self: /^\{"code":200,"msg":"Success","data":\{"user":\{"id":\d+,"username":"hello_\d+","nickname":"hello_\d+","avatar":"https:\/\/my-blog-store.oss-cn-guangzhou\.aliyuncs\.com\/store\/20201103002944_c9ed4\.jpeg","role":\d+}}}$/,
};
describe('UserController (e2e): /api/user', () => {
  const request = buildApp(async () => {
    await UserEntity.clear();
  });

  const prefix = '/api/user';
  it('/ (GET)', () => {
    return request().get(prefix).expect(200).expect(ResTypes.unauthorized);
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
          .expect(ResTypes.register);
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
        .send(user)
        .expect(ResTypes.register);

      return request()
        .post(prefix + '/login')
        .send(pick(user, ['password', 'username']))
        .expect(200)
        .expect(ResTypes.login);
    });
  });
  describe('/self (GET)获取个人信息', () => {
    it('未登录，获取失败', () => {
      return request()
        .get(prefix + '/self')
        .expect(200)
        .expect(ResTypes.unauthorized);
    });
    it('获取成功', async function () {
      await UserEntity.clear();
      const user = buildRegisterData();
      await request()
        .post(prefix + '/register')
        .send(user)
        .expect(ResTypes.register);

      const {
        body: {
          data: { token },
        },
      } = await request()
        .post(prefix + '/login')
        .send(pick(user, ['password', 'username']))
        .expect(ResTypes.login);

      expect(typeof token).toBe('string');

      return request()
        .get(prefix + '/self')
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .expect(ResTypes.self);
    });
  });
  function register(user: ReturnType<typeof buildRegisterData>) {
    return request()
      .post(prefix + '/register')
      .send(user);
  }
  function login(user: Pick<ReturnType<typeof buildRegisterData>, 'username' | 'password'>) {
    return request()
      .post(prefix + '/login')
      .send(pick(user, ['password', 'username']));
  }
  it('注册禁用词检验', () => {
    const user = buildRegisterData();
    user.username = 'admin';
    return register(user)
      .expect(200)
      .expect('{"code":400,"msg":"Validation failed: username(admin)包含禁用词!请修改后再提交"}');
  });
  describe('/:id (PATCH) 更新用户信息', function () {
    it('需要登录', async () => {
      await UserEntity.clear();

      const user1 = buildRegisterData();
      await register(user1);

      return request()
        .patch(prefix + '/1')
        .send({ nickname: 'abc123' })
        .expect(200)
        .expect(ResTypes.unauthorized);
    });
    it('禁止修改其他账号', async () => {
      await UserEntity.clear();

      const user1 = buildRegisterData();
      const id1 = await register(user1)
        .expect(ResTypes.register)
        .then((res) => res.body.data.id);

      const user2 = buildRegisterData();
      await register(user2).expect(ResTypes.register);

      const token = await login(user2)
        .expect(200)
        .expect(ResTypes.login)
        .then((res) => res.body.data.token);

      expect(typeof token).toBe('string');

      const userInfo = await request()
        .get(prefix + '/self')
        .set('authorization', 'Bearer ' + token)
        .expect(ResTypes.self)
        .then<Record<string, string>>((res) => res.body.data.user);

      return request()
        .patch(prefix + '/' + id1)
        .send({ nickname: 'abc123', avatar: userInfo['avatar'] })
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .expect('{"code":403,"msg":"禁止修改其他账号信息"}');
    });
  });
});
