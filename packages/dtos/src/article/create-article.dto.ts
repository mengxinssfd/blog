import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { BaseDto } from '../base.dto';
import { Transform } from 'class-transformer';
import { IsOptional, toBool } from '../utils';

export class CreateArticleDto extends BaseDto<CreateArticleDto> {
  @ApiProperty({ description: '标题', example: 'title hello world' })
  @MaxLength(254, { message: '标题最大长度为254' })
  @IsNotEmpty({ message: '标题不能为空' })
  @IsString({ message: '标题必须是字符串' })
  title!: string;

  @ApiProperty({ description: '描述', example: 'desc hello world' })
  @MaxLength(254, { message: '描述最大长度为254' })
  @IsNotEmpty({ message: '描述不能为空' })
  @IsString({ message: '描述必须是字符串' })
  description!: string;

  @ApiProperty({ description: '内容', example: 'content hello world' })
  @IsNotEmpty({ message: '内容不能为空' })
  @IsString({ message: '内容必须是字符串' })
  content!: string;

  @ApiProperty({ description: '分类', example: '1' })
  @IsNotEmpty({ message: '分类不能为空' })
  @IsNumber(undefined, { message: 'categoryId必须是数字' })
  categoryId!: number;

  @IsNotEmpty({ message: '标签不能为空' })
  @IsArray({ message: '标签必须是一个数组' })
  tags!: number[];

  @IsOptional()
  @MaxLength(500, { message: '背景音乐链接最大长度为500' })
  @IsUrl({}, { message: '背景音乐不是一个链接' })
  @IsString({ message: '背景音乐链接必须是字符串' })
  bgm?: string;

  @IsOptional()
  @MaxLength(500, { message: '封面链接最大长度为500' })
  @IsUrl(undefined, { message: '封面不是一个链接' })
  cover?: string;

  @IsOptional()
  @IsBoolean({ message: 'isPublic必须为boolean类型' })
  @Transform(toBool)
  isPublic?: boolean;
}
