import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { PickType } from '@nestjs/mapped-types';
import { LoginDTO } from './login.dto';

export class UpdatePasswordDto extends PickType(LoginDTO, ['password'] as const) {
  @ApiProperty({ example: '123456' })
  @IsNotEmpty({ message: '当前密码不能为空' })
  @IsString({ message: '当前密码必须是字符串类型' })
  readonly curPassword!: string;
}
