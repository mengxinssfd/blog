import { buildRegisterData, ResTypes } from './utils';
import { buildApp, clearAllTables } from '../utils';
import { userApi } from './api';

describe('UserController (e2e): /api/register (Post)', function () {
  const request = buildApp();
  const { register } = userApi(request);

  it('should success', async () => {
    await clearAllTables();
    for (let i = 0; i < 5; i++) {
      await register(buildRegisterData()).expect(201).expect(ResTypes.register);
    }
  });

  it('创建账号太多', () => {
    return register(buildRegisterData()).expect(200).expect('{"code":403,"msg":"创建账号太多"}');
  });

  describe('参数校验检测', function () {
    const _user = buildRegisterData();
    it('注册禁用词检验', () => {
      const user = { ..._user };
      user.username = 'admin';
      return register(user)
        .expect(200)
        .expect('{"code":400,"msg":"username(admin)包含禁用词!请修改后再提交"}');
    });
    describe('username', function () {
      it('用户名不能包含空格', () => {
        const user = { ..._user };
        user.username = '111 222';
        return register(user).expect(200).expect('{"code":400,"msg":"用户名不能包含空格"}');
      });
      it('用户名长度必须在2-12之间', async () => {
        const user = { ..._user };
        user.username = '1';
        await register(user).expect(200).expect('{"code":400,"msg":"用户名长度必须在2-12之间"}');
        user.username = '1'.repeat(13);
        await register(user).expect(200).expect('{"code":400,"msg":"用户名长度必须在2-12之间"}');
      });
    });
    describe('nickname', function () {
      it('昵称不能包含空格', () => {
        const user = { ..._user };
        user.nickname = '111 222';
        return register(user).expect(200).expect('{"code":400,"msg":"昵称不能包含空格"}');
      });
      it('昵称长度必须在2-24之间', async () => {
        const user = { ..._user };
        user.nickname = '1';
        await register(user).expect(200).expect('{"code":400,"msg":"昵称长度必须在2-24之间"}');
        user.nickname = '1'.repeat(13);
        await register(user).expect(200).expect('{"code":400,"msg":"昵称长度必须在2-24之间"}');
      });
    });
    describe('password', function () {
      it('密码不能为空', () => {
        const user = { ..._user };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        delete user.password;
        return register(user)
          .expect(200)
          .expect('{"code":400,"msg":"密码必须是字符串;密码长度必须在6-18之间;密码不能为空"}');
      });
      it('密码长度必须在6-18之间', async () => {
        const user = { ..._user };
        user.password = '111';
        await register(user).expect(200).expect('{"code":400,"msg":"密码长度必须在6-18之间"}');

        user.password = '1'.repeat(19);
        await register(user).expect(200).expect('{"code":400,"msg":"密码长度必须在6-18之间"}');
      });
    });
  });
});
