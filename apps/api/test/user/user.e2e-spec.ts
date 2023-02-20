import { buildApp } from '../utils';
import { ROLE, UserEntity } from '@blog/entities';
import { sleep } from '@tool-pack/basic';
import { buildRegisterData, ipGen, prefix, ResTypes } from './utils';
import { userApi } from './api';

describe('UserController (e2e): /api/user', () => {
  const request = buildApp(async () => {
    await UserEntity.clear();
  });

  afterAll(() => (console.log('ip gen', ipGen.next().value), sleep(200)));

  const { createUsers, register, login, setRole, removeUser, restore } = userApi(request);

  it('/ (GET)', () => {
    return request().get(prefix).expect(200).expect(ResTypes.unauthorized);
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
