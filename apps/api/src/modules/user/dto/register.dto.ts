import {
  IsNotEmpty,
  IsMobilePhone,
  Matches,
  Length,
  ValidateIf,
  MinLength,
  Validate,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { WordValidate } from '../word.validate';

export class RegisterInfoDTO {
  @ApiProperty({ example: 'javascript' })
  @Validate(WordValidate)
  @Matches(/^\S+$/, { message: '用户名不能包含空格' }) // 要为false的时候才能触发message
  @Length(2, 12, { message: '用户名长度必须在2-12' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @Expose()
  readonly username!: string;

  @ApiProperty({ example: 'javascript' })
  @Validate(WordValidate)
  @Matches(/^\S+$/, { message: '昵称不能包含空格' }) // 要为false的时候才能触发message
  @Length(2, 12, { message: '昵称长度必须在2-24' })
  @IsNotEmpty({ message: '昵称不能为空' })
  @Expose()
  nickname!: string;

  @ApiProperty({ example: '123456' })
  @MinLength(6, { message: '密码不能少于6位' })
  @IsNotEmpty({ message: '密码不能为空' })
  @Expose()
  readonly password!: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty({ message: '重复密码不能为空' })
  @Expose()
  readonly rePassword!: string;

  /*@ApiProperty({
    required: false,
    // description: '[用户角色]: 0-超级管理员 | 1-管理员 | 2-开发&测试&运营 | 3-普通用户（只能查看）',
  })*/
  @ApiPropertyOptional({ example: '18718033902' })
  @ValidateIf((o: RegisterInfoDTO) => !!o.mobile)
  @IsMobilePhone('zh-CN', { strictMode: false }, { message: '手机号码格式不正确' })
  // @IsNotEmpty({ message: '手机号码不能为空' })
  // @IsNumber()
  @Expose()
  readonly mobile?: string;
}
