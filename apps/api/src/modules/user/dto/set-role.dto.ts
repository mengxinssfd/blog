import { IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ROLE } from '@blog/entities';

const values = Object.values(ROLE).filter(
  (i: any) => typeof i === 'number' && i !== ROLE.superAdmin,
);
export class SetRoleDto {
  @ApiProperty({ description: '角色', example: 3 })
  @IsIn(values, { message: '角色必须是' + values.join(',') + '其中之一' })
  @IsNotEmpty({ message: '角色不能为空' })
  @Expose()
  readonly role!: ROLE;
}
