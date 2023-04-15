import { buildApp, clearAllTables } from '../utils';
import { ROLE, UserEntity } from '@blog/entities';
import { sleep } from '@tool-pack/basic';
import { buildRegisterData, ipGen, ResTypes } from './utils';
import { userApi, prefix } from './api';

describe('UserController (e2e): /api/user', () => {
  const request = buildApp(async () => {
    // await clearAllTables();
  });

  afterAll(() => (console.log('ip gen', ipGen.next().value), sleep(200)));

  const { createUsers, register, login, setRole, removeUser, restore, createAdmin } =
    userApi(request);

  it('/ (GET)', () => {
    return request().get(prefix).expect(200).expect(ResTypes.unauthorized);
  });

  describe('/:id (PATCH) 更新用户信息', function () {
    it('需要登录', async () => {
      await clearAllTables();

      const user1 = buildRegisterData();
      await register(user1);

      return request()
        .patch(prefix + '/1')
        .send({ nickname: 'abc123' })
        .expect(200)
        .expect(ResTypes.unauthorized);
    });
    it('禁止修改其他账号', async () => {
      await clearAllTables();

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
      await clearAllTables();

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
            `\\{"code":200,"msg":"Success","data":\\{"nickname":"abc123","avatar":"${UserEntity.DEFAULT_AVATAR}","id":${id},"updateBy":${id},"updateAt":"[^"]{24}","deletedAt":null,"mobile":null,"loginAt":null,"loginIp":null,"registerIp":null,"openid":null}}`,
          ),
        );
    });
  });

  describe('/role/:id (Patch) 设置role', () => {
    it('numeric string is expected', async () => {
      const admin = await createAdmin();
      return setRole('test' as any, admin.token, ROLE.admin).expect(
        '{"code":400,"msg":"Validation failed (numeric string is expected)"}',
      );
    });
    it('superAdmin有权限操作', async () => {
      const { admin, commonUser } = await createUsers();
      const {
        body: {
          data: { role },
        },
      } = await setRole(commonUser.id, admin.token, ROLE.admin).expect(ResTypes.setRole);
      expect(role).toBe(ROLE.admin);
      // superAdmin => commonUser
      await setRole(admin.id, admin.token, ROLE.commonUser).expect(ResTypes.setRole);
      const {
        body: {
          data: { token },
        },
      } = await login(admin);
      // 新token无权操作
      await setRole(commonUser.id, token, ROLE.commonUser).expect(ResTypes['403']);
      // 原token已不能使用 使用redis把旧的token踢下线
      await setRole(commonUser.id, admin.token, ROLE.commonUser).expect(
        '{"code":401,"msg":"已在其他地方登录"}',
      );
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
