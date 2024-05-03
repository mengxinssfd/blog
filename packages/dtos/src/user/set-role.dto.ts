import { IsNotEmpty, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { USER_ROLE } from '@blog/entities';
import { BaseDto } from '../base.dto';

const values = Object.values(USER_ROLE).filter((i: any) => typeof i === 'number');

export class SetRoleDto extends BaseDto<SetRoleDto> {
  @ApiProperty({ description: '角色', example: 3 })
  @IsEnum(USER_ROLE, { message: '角色必须是' + values.join(',') + '其中之一' })
  @IsNumber(undefined, { message: '角色必须是数字' })
  @IsNotEmpty({ message: '角色不能为空' })
  readonly role!: USER_ROLE;
}
