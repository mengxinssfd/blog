import { pick, pickByKeys } from '@tool-pack/basic';
import { buildRegisterData, ResTypes } from './utils';
import { buildApp, clearAllTables } from '../utils';
import { userApi } from './api';

describe('/login (POST)', () => {
  const request = buildApp();
  const { login, register } = userApi(request);
  it('账号不存在', async () => {
    await clearAllTables();
    const up = pickByKeys(buildRegisterData(), ['username', 'password']);
    return login(up).expect(200).expect('{"code":404,"msg":"账号不存在"}');
  });
  it('账号或密码不正确', async function () {
    const user = buildRegisterData();
    await register(user);

    return login({ username: user.username, password: '123' })
      .expect(200)
      .expect('{"code":401,"msg":"账号或密码不正确"}');
  });
  it('登录成功', async function () {
    const user = buildRegisterData();
    await register(user).expect(ResTypes.register);

    return login(pick(user, ['password', 'username']))
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
