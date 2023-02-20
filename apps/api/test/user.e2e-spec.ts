import { buildApp } from './utils';
import { UserEntity } from '@blog/entities';
import { idGen, pick } from '@tool-pack/basic';

// 常用的返回类型
const ResTypes = {
  success: '{"code":200,"msg":"Success"}',
  unauthorized: '{"code":401,"msg":"Unauthorized"}',
  register: /^\{"code":200,"msg":"Success","data":\{"id":\d+}}$/,
  login: /^\{"code":207,"msg":"Success","data":\{"token":"[^"]{149}"}}$/,
  self: new RegExp(
    `^\\{"code":200,"msg":"Success","data":\\{"user":\\{"id":\\d+,"username":"hello_\\d+","nickname":"hello_\\d+","avatar":"${UserEntity.DEFAULT_AVATAR}","role":\\d+}}}$`,
  ),
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
    it('修改成功', async () => {
      await UserEntity.clear();

      const user = buildRegisterData();
      const id = await register(user)
        .expect(ResTypes.register)
        .then((res) => res.body.data.id);

      const token = await login(user)
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
        .patch(prefix + '/' + id)
        .send({ nickname: 'abc123', avatar: userInfo['avatar'] })
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .expect(
          new RegExp(
            `\\{"code":200,"msg":"Success","data":\\{"nickname":"abc123","avatar":"${UserEntity.DEFAULT_AVATAR}","mobile":null,"id":${id},"updateBy":${id},"updateAt":"[^"]{24}","deletedAt":null,"loginAt":null,"loginIp":null,"registerIp":null,"openid":null}}`,
          ),
        );
    });
  });
  async function registerLogin(user: ReturnType<typeof buildRegisterData>) {
    const id = await register(user)
      .expect(ResTypes.register)
      .then<number>((res) => res.body.data.id);

    const token = await login(user)
      .expect(200)
      .expect(ResTypes.login)
      .then<string>((res) => res.body.data.token);
    return [id, token];
  }
  describe('/mute/:id (PATCH) 禁言', () => {
    async function createUsers() {
      await UserEntity.clear();

      const admin = buildRegisterData();
      const [adminId, adminToken] = await registerLogin(admin);

      const commonUser = buildRegisterData();
      const [commonUserId, commonUserToken] = await registerLogin(commonUser);
      return {
        admin: { id: adminId, token: adminToken },
        commonUser: { id: commonUserId, token: commonUserToken },
      };
    }

    it('普通用户无权禁言', async () => {
      const { admin, commonUser } = await createUsers();
      await request()
        .patch(prefix + '/mute/' + admin.id)
        .set('authorization', 'Bearer ' + commonUser.token)
        .expect(200)
        .expect('{"code":403,"msg":"无权操作"}');
      return request()
        .patch(prefix + '/mute/' + commonUser.id)
        .set('authorization', 'Bearer ' + commonUser.token)
        .expect(200)
        .expect('{"code":403,"msg":"无权操作"}');
    });
    it('superAdmin有权禁言普通用户', async () => {
      const { admin, commonUser } = await createUsers();
      return request()
        .patch(prefix + '/mute/' + commonUser.id)
        .set('authorization', 'Bearer ' + admin.token)
        .expect(200)
        .expect(ResTypes.success);
    });
    it('superAdmin无权禁言superAdmin', async () => {
      const { admin } = await createUsers();
      await request()
        .patch(prefix + '/mute/' + admin.id)
        .set('authorization', 'Bearer ' + admin.token)
        .expect(200)
        .expect('{"code":200,"msg":"不能禁言superAdmin"}');
    });
  });
});
