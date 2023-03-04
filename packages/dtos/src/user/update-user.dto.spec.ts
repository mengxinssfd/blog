import { UpdateUserDto } from './update-user.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('UpdateUserDto', () => {
  it('should be defined', () => {
    expect(new UpdateUserDto()).toBeDefined();
  });

  it('should validate correctly', async () => {
    const dto = new UpdateUserDto();
    const ins = plainToInstance(UpdateUserDto, dto);
    const errors = await validate(ins);
    expect(errors).toEqual([
      {
        children: [],
        constraints: {
          isNotEmpty: '头像不能为空',
          isString: '邮箱必须是字符串',
          isUrl: 'url格式不正确',
          maxLength: '头像URL长度必须在500以内',
        },
        property: 'avatar',
        target: {},
      },
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
    ]);
  });
});
