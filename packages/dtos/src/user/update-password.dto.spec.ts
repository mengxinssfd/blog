import { UpdatePasswordDto } from './update-password.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('UpdatePasswordDto', () => {
  it('should be defined', () => {
    expect(new UpdatePasswordDto()).toBeDefined();
  });

  it('should validate correctly', async () => {
    const dto = new UpdatePasswordDto();
    const ins = plainToInstance(UpdatePasswordDto, dto);
    const errors = await validate(ins);
    expect(errors).toEqual([
      {
        children: [],
        constraints: {
          isNotEmpty: '当前密码不能为空',
          isString: '当前密码必须是字符串类型',
        },
        property: 'curPassword',
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
