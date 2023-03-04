import {
  IsNotEmpty,
  IsMobilePhone,
  Matches,
  Length,
  Validate,
  IsString,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WordValidate } from './word.validate';
import { LoginDTO } from './login.dto';

export class RegisterDTO extends LoginDTO {
  constructor(options?: Partial<RegisterDTO>) {
    super(options);
  }

  @ApiProperty({ example: 'javascript' })
  @Validate(WordValidate)
  @Matches(/^\S+$/, { message: '昵称不能包含空格' }) // 要为false的时候才能触发message
  @Length(2, 12, { message: '昵称长度必须在2-24之间' })
  @IsNotEmpty({ message: '昵称不能为空' })
  nickname!: string;

  @ApiPropertyOptional({ example: '18718033802' })
  @IsOptional()
  @IsMobilePhone('zh-CN', { strictMode: false }, { message: '手机号码格式不正确' })
  @IsString({ message: '手机号码必须是字符串' })
  mobile?: string;
}
