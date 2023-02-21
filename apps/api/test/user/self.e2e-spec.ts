import { UserEntity } from '@blog/entities';
import { pick } from '@tool-pack/basic';
import { buildApp } from '../utils';
import { buildRegisterData, prefix, ResTypes } from './utils';

describe('/self (GET)获取个人信息', () => {
  const request = buildApp();
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
