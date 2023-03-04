import { WxLoginDTO } from './wx-login.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UserEntity } from '@blog/entities';

describe('WxLoginDTO', () => {
  it('should be defined', () => {
    expect(new WxLoginDTO()).toBeDefined();
  });

  it('should validate correctly', async () => {
    const dto = new WxLoginDTO();
    const ins = plainToInstance(WxLoginDTO, dto);
    const errors = await validate(ins);
    expect(errors).toEqual([
      {
        children: [],
        constraints: {
          isNotEmpty: 'nickName不能为空',
          isString: 'nickName必须是字符串',
        },
        property: 'nickName',
        target: {},
      },
      {
        children: [],
        constraints: {
          isNotEmpty: 'avatarUrl不能为空',
          isString: 'avatarUrl必须是字符串',
          isUrl: 'avatarUrl必须是链接',
        },
        property: 'avatarUrl',
        target: {},
      },
      {
        children: [],
        constraints: {
          isNotEmpty: 'code不能为空',
          isString: 'code必须是字符串',
        },
        property: 'code',
        target: {},
      },
    ]);
  });
  it('avatarUrl', async () => {
    const dto = new WxLoginDTO({ nickName: '111', code: '123', avatarUrl: '12312' });
    const ins = plainToInstance(WxLoginDTO, dto);
    const errors = await validate(ins);
    expect(errors).toEqual([
      {
        children: [],
        constraints: {
          isUrl: 'avatarUrl必须是链接',
        },
        property: 'avatarUrl',
        target: {
          avatarUrl: '12312',
          code: '123',
          nickName: '111',
        },
        value: '12312',
      },
    ]);
  });
  it('should validate correctly', async () => {
    const dto = new WxLoginDTO({
      nickName: '111',
      code: '123',
      avatarUrl: UserEntity.DEFAULT_AVATAR,
    });
    const ins = plainToInstance(WxLoginDTO, dto);
    const errors = await validate(ins);
    expect(errors).toEqual([]);
  });
});
