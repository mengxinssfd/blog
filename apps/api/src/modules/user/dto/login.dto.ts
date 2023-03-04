import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from '@/common/dto/base.dto';
import { IsNotEmpty, IsString, Length, Matches, Validate } from 'class-validator';
import { WordValidate } from '@/modules/user/word.validate';

export class LoginDTO extends BaseDto<LoginDTO> {
  @ApiProperty({ example: 'javascript' })
  @Validate(WordValidate)
  @Matches(/^\S+$/, { message: '用户名不能包含空格' }) // 要为false的时候才能触发message
  @Length(2, 12, { message: '用户名长度必须在2-12之间' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  username!: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty({ message: '密码不能为空' })
  @Length(6, 18, { message: '密码长度必须在6-18之间' })
  @IsString({ message: '密码必须是字符串' })
  password!: string;
}

export class LoginVO {
  @ApiProperty({ description: 'code', example: 200 })
  code!: number;
  @ApiProperty({ description: 'data', example: { token: '' } })
  data!: {
    token: string;
  };
  @ApiProperty({ description: 'msg' })
  msg!: string;
}
