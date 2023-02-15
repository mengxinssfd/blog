import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsUrl,
  Length,
  Matches,
  MaxLength,
  Validate,
  ValidateIf,
} from 'class-validator';
import { Expose } from 'class-transformer';
import { WordValidate } from '../word.validate';

export class UpdateUserDto {
  @ApiProperty({ example: 'javascript' })
  @Validate(WordValidate)
  @Matches(/^\S+$/, { message: '昵称不能包含空格' }) // 要为false的时候才能触发message
  @Length(2, 12, { message: '昵称长度必须在2-24' })
  @IsNotEmpty({ message: '昵称不能为空' })
  @Expose()
  nickname!: string;

  @ApiProperty({ example: 'javascript' })
  @IsUrl({}, { message: 'url格式不正确' })
  @MaxLength(500)
  @IsNotEmpty({ message: '头像不能为空' })
  @Expose()
  avatar!: string;

  @ApiPropertyOptional({ example: '18718033902' })
  @ValidateIf((o: UpdateUserDto) => !!o.mobile)
  @IsMobilePhone('zh-CN', { strictMode: false }, { message: '手机号码格式不正确' })
  @Expose()
  mobile?: string;

  @ApiPropertyOptional({ example: '' })
  @ValidateIf((o: UpdateUserDto) => !!o.email)
  @IsEmail({}, { message: '邮箱格式不正确' })
  @Expose()
  email?: string;
}
