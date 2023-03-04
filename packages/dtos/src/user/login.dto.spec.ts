import { LoginDTO } from './login.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('RegisterDto', () => {
  it('should be defined', () => {
    expect(new LoginDTO()).toBeDefined();
  });

  it('should validate correctly', async () => {
    const dto = new LoginDTO();
    const ins = plainToInstance(LoginDTO, dto);
    const errors = await validate(ins);
    expect(errors).toEqual([
      {
        children: [],
        constraints: {
          isLength: '用户名长度必须在2-12之间',
          isNotEmpty: '用户名不能为空',
          matches: '用户名不能包含空格',
          isString: '用户名必须是字符串',
        },
        property: 'username',
        target: {},
      },
      {
        children: [],
        constraints: {
          isLength: '密码长度必须在6-18之间',
          isNotEmpty: '密码不能为空',
          isString: '密码必须是字符串',
        },
        property: 'password',
        target: {},
      },
    ]);
  });
});
