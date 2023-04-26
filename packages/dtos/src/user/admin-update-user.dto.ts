import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length, Matches } from 'class-validator';
import { UpdateUserDto } from './update-user.dto';

/**
 * 移除了nickname关键词校验的UpdateUserDto
 */
export class AdminUpdateUserDto extends UpdateUserDto {
  constructor(options?: Partial<AdminUpdateUserDto>) {
    super(options);
  }

  @ApiProperty({ example: 'javascript' })
  @Matches(/^\S+$/, { message: '昵称不能包含空格' }) // 要为false的时候才能触发message
  @Length(2, 12, { message: '昵称长度必须在2-24之间' })
  @IsNotEmpty({ message: '昵称不能为空' })
  override nickname!: string;
}
