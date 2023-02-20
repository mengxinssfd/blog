import { buildRegisterData, prefix, ResTypes } from './utils';
import { buildApp } from '../utils';
import { userApi } from './api';
import { UserEntity } from '@blog/entities';

describe('UserController (e2e): /api/register (Post)', function () {
  const request = buildApp();
  const { register } = userApi(request);

  it('should success', async () => {
    await UserEntity.clear();
    for (let i = 0; i < 5; i++) {
      await request()
        .post(prefix + '/register')
        .send(buildRegisterData())
        .expect(201)
        .expect(ResTypes.register);
    }
  });

  it('创建账号太多', () => {
    return request()
      .post(prefix + '/register')
      .send(buildRegisterData())
      .expect(200)
      .expect('{"code":403,"msg":"创建账号太多"}');
  });
  it('注册禁用词检验', () => {
    const user = buildRegisterData();
    user.username = 'admin';
    return register(user)
      .expect(200)
      .expect('{"code":400,"msg":"Validation failed: username(admin)包含禁用词!请修改后再提交"}');
  });
});
