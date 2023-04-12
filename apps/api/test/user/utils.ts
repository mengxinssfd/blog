import { createUUID, idGen } from '@tool-pack/basic';
import { UserEntity } from '@blog/entities';

const id = idGen();
export function buildRegisterData() {
  const name = 'hello_' + id.next().value;
  const password = createUUID('xxxxxx');
  return {
    username: name,
    password,
    rePassword: password,
    nickname: name,
    // mobile: '',
  };
}

export const ipGen = idGen(1, 1, 255);
// Jest has detected the following 1 open handle potentially keeping Jest from exiting
// 常用的返回类型
export const ResTypes = {
  success: '{"code":200,"msg":"Success"}',
  unauthorized: '{"code":401,"msg":"Unauthorized"}',
  register: /^\{"code":201,"msg":"Success","data":\{"id":\d+}}$/,
  login: /^\{"code":207,"msg":"Success","data":\{"token":"[^"]{149}"}}$/,
  self: new RegExp(
    `^\\{"code":200,"msg":"Success","data":\\{"user":\\{"id":\\d+,"username":"hello_\\d+","nickname":"hello_\\d+","avatar":"${UserEntity.DEFAULT_AVATAR}","role":\\d+}}}$`,
  ),
  setRole: new RegExp(`\\{"code":200,"msg":"Success","data":\\{"role":\\d+}}`),
  403: '{"code":403,"msg":"无权操作"}',
  notFoundUser: '{"code":404,"msg":"账号不存在"}',
};
