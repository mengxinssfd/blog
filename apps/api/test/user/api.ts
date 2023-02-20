import { pick } from '@tool-pack/basic';
import { UpdatePasswordDto } from '@/modules/user/dto/update-password.dto';
import { ROLE, UserEntity } from '@blog/entities';
import { buildRegisterData, ipGen, prefix, ResTypes } from './utils';
import { SuperTest, Test } from 'supertest';

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
    await UserEntity.clear();

    const admin = buildRegisterData();
    const [adminId, adminToken] = await registerLogin(admin);

    const commonUser = buildRegisterData();
    const [commonUserId, commonUserToken] = await registerLogin(commonUser);
    return {
      admin: { ...admin, id: adminId, token: adminToken },
      commonUser: { ...commonUser, id: commonUserId, token: commonUserToken },
    };
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
  };
}
