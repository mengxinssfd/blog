import { RegisterDTO } from '@/modules/user/dto/register.dto';
import { plainToInstance } from 'class-transformer';
import { validate, validateSync } from 'class-validator';

describe('RegisterDto', () => {
  it('should be defined', () => {
    expect(new RegisterDTO()).toBeDefined();
  });

  it('should validate correctly', async () => {
    const dto = new RegisterDTO();
    const ins = plainToInstance(RegisterDTO, dto);
    const errors = await validate(ins);
    expect(errors).toEqual([
      {
        children: [],
        constraints: {
          isLength: '昵称长度必须在2-24之间',
          isNotEmpty: '昵称不能为空',
          matches: '昵称不能包含空格',
        },
        property: 'nickname',
        target: {},
      },
      {
        children: [],
        constraints: {
          isLength: '用户名长度必须在2-12之间',
          isNotEmpty: '用户名不能为空',
          isString: '用户名必须是字符串',
          matches: '用户名不能包含空格',
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
  it('whitelist', () => {
    const dto = new RegisterDTO({ username: '1111 11', password: '2222222', nickname: '3333333' });
    const ins = plainToInstance(RegisterDTO, { ...dto, test: 123, test2: 233 });
    expect(ins).not.toEqual(dto);
    // 加了whitelist后，会把ins多余的属性去掉
    expect(validateSync(ins, { whitelist: true })).toEqual([
      {
        children: [],
        constraints: {
          matches: '用户名不能包含空格',
        },
        property: 'username',
        target: {
          nickname: '3333333',
          password: '2222222',
          username: '1111 11',
        },
        value: '1111 11',
      },
    ]);
    expect(ins).toEqual(dto);
  });
  it('optional', () => {
    const dto = new RegisterDTO({
      username: '111111',
      password: '2222222',
      nickname: '3333333',
      mobile: 12312 as any,
    });
    const ins = plainToInstance(RegisterDTO, dto);
    expect(validateSync(ins)).toEqual([
      {
        children: [],
        constraints: {
          isMobilePhone: '手机号码格式不正确',
          isString: '手机号码必须是字符串',
        },
        property: 'mobile',
        target: {
          mobile: 12312,
          nickname: '3333333',
          password: '2222222',
          username: '111111',
        },
        value: 12312,
      },
    ]);

    dto.mobile = '123';
    const ins2 = plainToInstance(RegisterDTO, dto);
    expect(validateSync(ins2)).toEqual([
      {
        children: [],
        constraints: {
          isMobilePhone: '手机号码格式不正确',
        },
        property: 'mobile',
        target: {
          mobile: '123',
          nickname: '3333333',
          password: '2222222',
          username: '111111',
        },
        value: '123',
      },
    ]);

    dto.mobile = '13719035000';
    const ins3 = plainToInstance(RegisterDTO, dto);
    expect(validateSync(ins3)).toEqual([]);
  });
});
