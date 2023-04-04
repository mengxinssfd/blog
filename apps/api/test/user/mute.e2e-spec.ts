import { buildApp } from '../utils';
import { userApi } from './api';
import { ResTypes } from './utils';

describe('/mute/:id (PATCH) 禁言', () => {
  const request = buildApp();
  const { createUsers, mute } = userApi(request);

  it('普通用户无权禁言', async () => {
    const { admin, commonUser } = await createUsers();
    await mute(admin.id, commonUser.token, true).expect(200).expect(ResTypes['403']);
    return mute(commonUser.id, commonUser.token, true).expect(200).expect(ResTypes['403']);
  });
  it('superAdmin有权禁言普通用户', async () => {
    const { admin, commonUser } = await createUsers();
    return mute(commonUser.id, admin.token, true).expect(200).expect(ResTypes.success);
  });
  it('superAdmin无权禁言superAdmin', async () => {
    const { admin } = await createUsers();
    await mute(admin.id, admin.token, true)
      .expect(200)
      .expect('{"code":403,"msg":"不能禁言superAdmin"}');
  });
});
