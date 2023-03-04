import { pick } from '@tool-pack/basic';
import { UpdatePasswordDto } from '@blog/dtos';
import { ROLE } from '@blog/entities';
import { buildRegisterData, ipGen, ResTypes } from './utils';
import { SuperTest, Test } from 'supertest';
import { clearAllTables } from '../utils';

export const prefix = '/api/user';

export function userApi(request: () => SuperTest<Test>) {
  function register(user: ReturnType<typeof buildRegisterData>) {
    return request()
      .post(prefix + '/register')
      .send(user);
  }
  function login(
    user: Pick<ReturnType<typeof buildRegisterData>, 'username' | 'password'>,
    useIp = false,
  ) {
    const req = request()
      .post(prefix + '/login')
      .send(pick(user, ['password', 'username']));
    if (useIp) {
      req.set('X-Forwarded-For', '127.0.1.' + ipGen.next().value);
    }
    return req;
  }
  function updatePassword(
    id: number | string,
    token: string,
    data: Omit<UpdatePasswordDto, 'rePassword'>,
  ) {
    return request()
      .patch(prefix + '/password/' + id)
      .set('authorization', 'Bearer ' + token)
      .send({ ...data, rePassword: data.password } as UpdatePasswordDto);
  }

  function getSelf(token: string) {
    return request()
      .get(prefix + '/self')
      .set('authorization', 'Bearer ' + token);
  }

  function deleteUser(id: number, token: string) {
    return request()
      .delete(prefix + '/delete/' + id)
      .set('authorization', 'Bearer ' + token);
  }

  /**
   * 软删除
   */
  function removeUser(id: number, token: string) {
    return request()
      .delete(prefix + '/' + id)
      .set('authorization', 'Bearer ' + token);
  }
  function setRole(id: number, token: string, role: ROLE) {
    return request()
      .patch(prefix + '/role/' + id)
      .set('authorization', 'Bearer ' + token)
      .send({ role });
  }
  function restore(id: number, token: string) {
    return request()
      .patch(prefix + '/restore/' + id)
      .set('authorization', 'Bearer ' + token);
  }

  async function registerLogin(
    user: ReturnType<typeof buildRegisterData>,
  ): Promise<[number, string]> {
    const id = await register(user)
      .expect(ResTypes.register)
      .then<number>((res) => res.body.data.id);

    const ip = '127.0.0.' + ipGen.next().value;
    const token = await login(user)
      .set('X-Forwarded-For', ip)
      .expect(200)
      .expect(ResTypes.login)
      .then<string>((res) => res.body.data.token);
    return [id, token];
  }

  async function createUsers() {
    const admin = await createAdmin();

    const commonUser = buildRegisterData();
    const [commonUserId, commonUserToken] = await registerLogin(commonUser);
    return {
      admin,
      commonUser: { ...commonUser, id: commonUserId, token: commonUserToken },
    };
  }

  async function registerAndSetRole(token: string, role: ROLE) {
    const user = buildRegisterData();
    const [id /* devToken */ /* 该token的role仍然是commonUser */] = await registerLogin(user);
    const _token = await setRole(id, token, role)
      .expect(ResTypes.setRole)
      .then<string>((res) => res.body.data.token);

    return { ...user, id: id, token: _token };
  }

  async function createAllRoleUsers() {
    const { admin: superAdmin, commonUser: common } = await createUsers();

    const dev = await registerAndSetRole(superAdmin.token, ROLE.dev);

    const dev2 = await registerAndSetRole(superAdmin.token, ROLE.dev);

    const admin = await registerAndSetRole(superAdmin.token, ROLE.admin);

    return { superAdmin, common, dev, dev2, admin };
  }

  async function createAdmin() {
    await clearAllTables();

    const admin = buildRegisterData();
    const [id, token] = await registerLogin(admin);
    return { ...admin, id, token };
  }

  function mute(id: number, token: string) {
    return request()
      .patch(prefix + '/mute/' + id)
      .set('authorization', 'Bearer ' + token);
  }

  return {
    restore,
    setRole,
    removeUser,
    deleteUser,
    getSelf,
    updatePassword,
    login,
    register,
    registerLogin,
    createUsers,
    mute,
    createAdmin,
    createAllRoleUsers,
  };
}
