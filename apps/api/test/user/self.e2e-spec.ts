import { pick } from '@tool-pack/basic';
import { buildApp, clearAllTables } from '../utils';
import { buildRegisterData, ResTypes } from './utils';
import { userApi } from './api';

describe('/self (GET)获取个人信息', () => {
  const request = buildApp();
  const { getSelf, register, login } = userApi(request);
  it('未登录，获取失败', () => {
    return getSelf('').expect(200).expect(ResTypes.unauthorized);
  });
  it('获取成功', async function () {
    await clearAllTables();
    const user = buildRegisterData();
    await register(user).expect(ResTypes.register);

    const {
      body: {
        data: { token },
      },
    } = await login(pick(user, ['password', 'username'])).expect(ResTypes.login);

    expect(typeof token).toBe('string');

    return getSelf(token).expect(200).expect(ResTypes.self);
  });
});
