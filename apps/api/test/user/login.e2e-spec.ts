import { UserEntity } from '@blog/entities';
import { pick } from '@tool-pack/basic';
import { buildRegisterData, prefix, ResTypes } from './utils';
import { buildApp } from '../utils';
import { userApi } from './api';

describe('/login (POST)', () => {
  const request = buildApp();
  const { login, register } = userApi(request);
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
