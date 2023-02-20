import { buildApp } from './utils';
import { ROLE, UserEntity } from '@blog/entities';
import { createUUID, idGen, pick, sleep } from '@tool-pack/basic';
import { UpdatePasswordDto } from '@/modules/user/dto/update-password.dto';

describe('UserController (e2e): /api/user', () => {
  const request = buildApp(async () => {
    await UserEntity.clear();
  });

  afterAll(() => (console.log('ip gen', ipGen.next().value), sleep(200)));

  const prefix = '/api/user';

  // 常用的返回类型
  const ResTypes = {
    success: '{"code":200,"msg":"Success"}',
    unauthorized: '{"code":401,"msg":"Unauthorized"}',
    register: /^\{"code":200,"msg":"Success","data":\{"id":\d+}}$/,
    login: /^\{"code":207,"msg":"Success","data":\{"token":"[^"]{149}"}}$/,
    self: new RegExp(
      `^\\{"code":200,"msg":"Success","data":\\{"user":\\{"id":\\d+,"username":"hello_\\d+","nickname":"hello_\\d+","avatar":"${UserEntity.DEFAULT_AVATAR}","role":\\d+}}}$`,
    ),
    setRole: new RegExp(
      `\\{"code":207,"msg":"Success","data":\\{"token":"[^"]{149}","user":\\{"id":\\d,"nickname":"hello_\\d+","avatar":"${UserEntity.DEFAULT_AVATAR}","role":\\d,"loginAt":(null|("[^"]{24}"))}}}`,
    ),
    403: '{"code":403,"msg":"无权操作"}',
    notFoundUser: '{"code":404,"msg":"账号不存在"}',
  };
  const id = idGen();
  function buildRegisterData() {
    const name = 'hello_' + id.next().value;
    const password = createUUID('xxxxxx');
    return {
      username: name,
      password,
      rePassword: password,
      nickname: name,
      mobile: '',
    };
  }
  function register(user: ReturnType<typeof buildRegisterData>) {
    return request()
      .post(prefix + '/register')
      .send(user);
  }
  function login(
    user: Pick<ReturnType<typeof buildRegisterData>, 'username' | 'password'>,
    useIp = false,
  ) {
    const req = request()
      .post(prefix + '/login')
      .send(pick(user, ['password', 'username']));
    if (useIp) {
      req.set('X-Forwarded-For', '127.0.1.' + ipGen.next().value);
    }
    return req;
  }
  function updatePassword(
    id: number | string,
    token: string,
    data: Omit<UpdatePasswordDto, 'rePassword'>,
  ) {
    return request()
      .patch(prefix + '/password/' + id)
      .set('authorization', 'Bearer ' + token)
      .send({ ...data, rePassword: data.password } as UpdatePasswordDto);
  }

  function getSelf(token: string) {
    return request()
      .get(prefix + '/self')
      .set('authorization', 'Bearer ' + token);
  }

  function deleteUser(id: number, token: string) {
    return request()
      .delete(prefix + '/delete/' + id)
      .set('authorization', 'Bearer ' + token);
  }

  /**
   * 软删除
   */
  function removeUser(id: number, token: string) {
    return request()
      .delete(prefix + '/' + id)
      .set('authorization', 'Bearer ' + token);
  }
  function setRole(id: number, token: string, role: ROLE) {
    return request()
      .patch(prefix + '/role/' + id)
      .set('authorization', 'Bearer ' + token)
      .send({ role });
  }
  function restore(id: number, token: string) {
    return request()
      .patch(prefix + '/restore/' + id)
      .set('authorization', 'Bearer ' + token);
  }

  const ipGen = idGen(1, 1, 255);
  async function registerLogin(
    user: ReturnType<typeof buildRegisterData>,
  ): Promise<[number, string]> {
    const id = await register(user)
      .expect(ResTypes.register)
      .then<number>((res) => res.body.data.id);

    const ip = '127.0.0.' + ipGen.next().value;
    const token = await login(user)
      .set('X-Forwarded-For', ip)
      .expect(200)
      .expect(ResTypes.login)
      .then<string>((res) => res.body.data.token);
    return [id, token];
  }

  async function createUsers() {
    await UserEntity.clear();

    const admin = buildRegisterData();
    const [adminId, adminToken] = await registerLogin(admin);

    const commonUser = buildRegisterData();
    const [commonUserId, commonUserToken] = await registerLogin(commonUser);
    return {
      admin: { ...admin, id: adminId, token: adminToken },
      commonUser: { ...commonUser, id: commonUserId, token: commonUserToken },
    };
  }

  it('/ (GET)', () => {
    return request().get(prefix).expect(200).expect(ResTypes.unauthorized);
  });

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
        .expect('{"code":404,"msg":"账号不存在"}');
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
    it('登录频率限制，短时间内调用6次登录接口，就会触发登录频率限制', async () => {
      const user = buildRegisterData();
      await register(user);

      await login(user).set('X-Forwarded-For', '128.0.0.1').expect(ResTypes.login);
      await login(user).set('X-Forwarded-For', '128.0.0.1').expect(ResTypes.login);
      await login(user).set('X-Forwarded-For', '128.0.0.1').expect(ResTypes.login);
      await login(user).set('X-Forwarded-For', '128.0.0.1').expect(ResTypes.login);
      await login(user).set('X-Forwarded-For', '128.0.0.1').expect(ResTypes.login);
      await login(user)
        .set('X-Forwarded-For', '128.0.0.1')
        .expect('{"code":429,"msg":"请求过于频繁","data":"ThrottlerException: Too Many Requests"}');
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
        .set('X-Forwarded-For', '127.0.1.1')
        // .set('X-Real-IP', '127.0.1.199')
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

  describe('/mute/:id (PATCH) 禁言', () => {
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
        .expect('{"code":403,"msg":"不能禁言superAdmin"}');
    });
  });
  describe('/password/:id (PATCH) 更换密码', () => {
    describe('admin', () => {
      // 目前无法让token失效
      // it('可以更换所有人的密码，更新过的代码token会失效，且原密码无法再登录', async () => {
      it('可以更换普通账号的密码，且原密码无法再使用', async () => {
        const { admin, commonUser } = await createUsers();
        const newPassword = '1234555';

        // 更换密码
        await updatePassword(commonUser.id, admin.token, {
          password: newPassword,
          curPassword: commonUser.password,
        }).expect(ResTypes.success);

        // 获取信息
        await getSelf(commonUser.token).expect(ResTypes.self);

        // 原密码登录失效
        await login({ username: commonUser.username, password: commonUser.password }, true).expect(
          '{"code":401,"msg":"账号或密码不正确"}',
        );
        // 新密码登录成功
        return login({ username: commonUser.username, password: newPassword }, true).expect(
          ResTypes.login,
        );
      });
      it('可以更换自己账号的密码，且原密码无法再使用', async () => {
        await UserEntity.clear();

        const admin = buildRegisterData();
        const [id, token] = await registerLogin(admin);
        const newPassword = '1234533';

        // 更换密码
        await updatePassword(id, token, {
          password: newPassword,
          curPassword: admin.password,
        }).expect(ResTypes.success);

        // 获取信息
        await getSelf(token).expect(ResTypes.self);

        // 原密码登录失效
        await login({ username: admin.username, password: admin.password }, true).expect(
          '{"code":401,"msg":"账号或密码不正确"}',
        );
        // 新密码登录成功
        return login({ username: admin.username, password: newPassword }, true).expect(
          ResTypes.login,
        );
      });
      it('账号不存在', async () => {
        await UserEntity.clear();

        const admin = buildRegisterData();
        const [, token] = await registerLogin(admin);
        const newPassword = '1234533';

        await updatePassword('999', token, {
          password: newPassword,
          curPassword: admin.password,
        }).expect(ResTypes.notFoundUser);
      });
    });
    describe('common user', () => {
      it('可以更换自己账号的密码，且原密码无法再使用', async () => {
        const { admin, commonUser } = await createUsers();
        const newPassword = admin.password + '111';

        // 更换密码
        await updatePassword(commonUser.id, commonUser.token, {
          password: newPassword,
          curPassword: commonUser.password,
        }).expect(ResTypes.success);

        // 获取信息
        await getSelf(commonUser.token).expect(ResTypes.self);

        // 原密码登录失效
        await login({ username: commonUser.username, password: commonUser.password }, true).expect(
          '{"code":401,"msg":"账号或密码不正确"}',
        );
        // 新密码登录成功
        return login({ username: commonUser.username, password: newPassword }, true).expect(
          ResTypes.login,
        );
      });
      it('不可以更改其它账号的密码', async () => {
        const { admin, commonUser } = await createUsers();
        const newPassword = admin.password + '111';

        const commonUser2 = buildRegisterData();
        const [id, token] = await registerLogin(commonUser2);

        // 更换密码
        await updatePassword(id, commonUser.token, {
          password: newPassword,
          curPassword: commonUser2.password,
        }).expect('{"code":403,"msg":"禁止修改其它账号的密码"}');

        // 获取信息
        await getSelf(token).expect(ResTypes.self);

        // 原密码登录成功
        await login(
          { username: commonUser2.username, password: commonUser2.password },
          true,
        ).expect(ResTypes.login);
      });
    });
  });
  describe('/delete/:id (Delete) 真删除账号', () => {
    it('superAdmin可以删除除superAdmin以外的账号', async () => {
      const { admin, commonUser } = await createUsers();
      await deleteUser(commonUser.id, admin.token).expect(ResTypes.success);
      await deleteUser(admin.id, admin.token).expect(
        '{"code":403,"msg":"不能删除superAdmin的账号"}',
      );
    });
    it('普通用户不能删除任何账号', async () => {
      const { admin, commonUser } = await createUsers();
      await deleteUser(commonUser.id, commonUser.token).expect('{"code":403,"msg":"无权操作"}');
      await deleteUser(admin.id, commonUser.token).expect('{"code":403,"msg":"无权操作"}');
    });
  });
  describe('/:id (Delete) 软删除账号', () => {
    it('superAdmin可以删除除superAdmin以外的账号', async () => {
      const { admin, commonUser } = await createUsers();
      await removeUser(commonUser.id, admin.token).expect(ResTypes.success);
      await removeUser(admin.id, admin.token).expect(
        '{"code":403,"msg":"不能删除superAdmin的账号"}',
      );
    });
    it('普通用户不能删除任何账号', async () => {
      const { admin, commonUser } = await createUsers();
      await removeUser(commonUser.id, commonUser.token).expect(ResTypes['403']);
      await removeUser(admin.id, commonUser.token).expect(ResTypes['403']);
    });
  });
  describe('/role/:id (Patch) 设置role', () => {
    it('superAdmin有权限操作', async () => {
      const { admin, commonUser } = await createUsers();
      const {
        body: {
          data: { user },
        },
      } = await setRole(commonUser.id, admin.token, ROLE.admin).expect(ResTypes.setRole);
      expect(user.role).toBe(ROLE.admin);
      // superAdmin => commonUser
      const {
        body: {
          data: { token },
        },
      } = await setRole(admin.id, admin.token, ROLE.commonUser).expect(ResTypes.setRole);
      // 新token无权操作
      await setRole(commonUser.id, token, ROLE.commonUser).expect(ResTypes['403']);
      // 原token还是能用的 todo 需要使用redis把旧的token踢下线
      await setRole(commonUser.id, admin.token, ROLE.commonUser).expect(ResTypes.setRole);
    });
    it('普通用户无权限操作', async () => {
      const { admin, commonUser } = await createUsers();
      await setRole(commonUser.id, commonUser.token, ROLE.admin).expect(ResTypes['403']);
      await setRole(admin.id, commonUser.token, ROLE.admin).expect(ResTypes['403']);
    });
  });
  describe('/restore/:id (Patch) 恢复被软删除的账号', () => {
    it('superAdmin有权限操作', async () => {
      const { admin, commonUser } = await createUsers();
      await removeUser(commonUser.id, admin.token).expect(ResTypes.success);
      await restore(commonUser.id, admin.token).expect(ResTypes.success);
      // 不存在的账号也是成功的，不会去校验这个id是否存在
      await restore(999, admin.token).expect(ResTypes.success);
    });
    it('普通用户无权限操作', async () => {
      const { admin, commonUser } = await createUsers();
      await removeUser(commonUser.id, commonUser.token).expect(ResTypes['403']);
      await removeUser(admin.id, commonUser.token).expect(ResTypes['403']);
    });
  });
});
