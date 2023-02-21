import { buildRegisterData, ResTypes } from './utils';
import { buildApp, clearAllTables } from '../utils';
import { userApi } from './api';

describe('UserController (e2e): /api/register (Post)', function () {
  const request = buildApp();
  const { register } = userApi(request);

  it('should success', async () => {
    await clearAllTables();
    for (let i = 0; i < 5; i++) {
      await register(buildRegisterData()).expect(201).expect(ResTypes.register);
    }
  });

  it('创建账号太多', () => {
    return register(buildRegisterData()).expect(200).expect('{"code":403,"msg":"创建账号太多"}');
  });
  it('注册禁用词检验', () => {
    const user = buildRegisterData();
    user.username = 'admin';
    return register(user)
      .expect(200)
      .expect('{"code":400,"msg":"Validation failed: username(admin)包含禁用词!请修改后再提交"}');
  });
});
