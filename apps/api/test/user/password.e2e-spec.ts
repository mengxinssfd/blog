import { buildApp, clearAllTables } from '../utils';
import { userApi } from './api';
import { buildRegisterData, ResTypes } from './utils';

describe('/password/:id (PATCH) 更换密码', () => {
  const request = buildApp();
  const { createUsers, updatePassword, getSelf, login, registerLogin } = userApi(request);
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
      await clearAllTables();

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
      await clearAllTables();

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
      await login({ username: commonUser2.username, password: commonUser2.password }, true).expect(
        ResTypes.login,
      );
    });
  });
});
