import { buildApp } from '../utils';
import { userApi } from './api';
import { prefix, ResTypes } from './utils';

describe('/mute/:id (PATCH) 禁言', () => {
  const request = buildApp();
  const { createUsers } = userApi(request);

  it('普通用户无权禁言', async () => {
    const { admin, commonUser } = await createUsers();
    await request()
      .patch(prefix + '/mute/' + admin.id)
      .set('authorization', 'Bearer ' + commonUser.token)
      .expect(200)
      .expect('{"code":403,"msg":"无权操作"}');
    return request()
      .patch(prefix + '/mute/' + commonUser.id)
      .set('authorization', 'Bearer ' + commonUser.token)
      .expect(200)
      .expect('{"code":403,"msg":"无权操作"}');
  });
  it('superAdmin有权禁言普通用户', async () => {
    const { admin, commonUser } = await createUsers();
    return request()
      .patch(prefix + '/mute/' + commonUser.id)
      .set('authorization', 'Bearer ' + admin.token)
      .expect(200)
      .expect(ResTypes.success);
  });
  it('superAdmin无权禁言superAdmin', async () => {
    const { admin } = await createUsers();
    await request()
      .patch(prefix + '/mute/' + admin.id)
      .set('authorization', 'Bearer ' + admin.token)
      .expect(200)
      .expect('{"code":403,"msg":"不能禁言superAdmin"}');
  });
});
