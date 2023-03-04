import { SetRoleDto } from './set-role.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ROLE } from '@blog/entities';

describe('SetRoleDto', () => {
  it('should be defined', () => {
    expect(new SetRoleDto()).toBeDefined();
  });

  it('should validate correctly', async () => {
    const dto = new SetRoleDto();
    const ins = plainToInstance(SetRoleDto, dto);
    const errors = await validate(ins);
    expect(errors).toEqual([
      {
        children: [],
        constraints: {
          isEnum: '角色必须是0,1,2,3其中之一',
          isNotEmpty: '角色不能为空',
          isNumber: '角色必须是数字',
        },
        property: 'role',
        target: {},
      },
    ]);
  });
  it('should validate correctly', async () => {
    const dto = new SetRoleDto({ role: ROLE[ROLE.admin] as any });
    const ins = plainToInstance(SetRoleDto, dto);
    const errors = await validate(ins);
    expect(errors).toEqual([
      {
        children: [],
        constraints: {
          isNumber: '角色必须是数字',
        },
        property: 'role',
        target: {
          role: 'admin',
        },
        value: 'admin',
      },
    ]);
  });
});
