import { ResTypes } from './utils';
import { buildApp } from '../utils';
import { userApi } from './api';

describe('删除账号与恢复账号', function () {
  const request = buildApp();
  const { createUsers, deleteUser, removeUser, restore } = userApi(request);

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
