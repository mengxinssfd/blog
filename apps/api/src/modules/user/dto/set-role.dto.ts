import { IsNotEmpty, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ROLE } from '@blog/entities';
import { BaseDto } from '@/common/dto/base.dto';

const values = Object.values(ROLE).filter((i: any) => typeof i === 'number');

export class SetRoleDto extends BaseDto<SetRoleDto> {
  @ApiProperty({ description: '角色', example: 3 })
  @IsEnum(ROLE, { message: '角色必须是' + values.join(',') + '其中之一' })
  @IsNumber(undefined, { message: '角色必须是数字' })
  @IsNotEmpty({ message: '角色不能为空' })
  readonly role!: ROLE;
}
