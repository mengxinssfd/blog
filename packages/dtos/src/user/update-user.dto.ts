import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { RegisterDTO } from './register.dto';
import { PickType } from '@nestjs/mapped-types';

export class UpdateUserDto extends PickType(RegisterDTO, ['nickname', 'mobile'] as const) {
  constructor(options?: Partial<UpdateUserDto>) {
    super(options);
  }

  @ApiProperty({ example: 'javascript' })
  @IsUrl({}, { message: 'url格式不正确' })
  @MaxLength(500, { message: '头像URL长度必须在500以内' })
  @IsNotEmpty({ message: '头像不能为空' })
  @IsString({ message: '邮箱必须是字符串' })
  avatar!: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsString({ message: '邮箱必须是字符串' })
  email?: string;
}
