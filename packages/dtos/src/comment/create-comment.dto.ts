import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Validate,
  ValidateIf,
} from 'class-validator';
import { WordValidate } from '../word.validate';
import { IsOptional } from '../utils';
import { PartialType } from '@nestjs/mapped-types';
import { CommentEntity } from '@blog/entities';

export class CreateCommentDto extends PartialType(CommentEntity) {
  @ApiProperty({ description: '评论内容', example: '' })
  @IsNotEmpty({ message: '评论内容不能为空' })
  @MaxLength(800, { message: '评论内容不能超过800' })
  @IsString({ message: '内容必须是字符串' })
  @Validate(WordValidate)
  override content!: string;

  @ApiProperty({ description: '文章id', example: '' })
  @IsOptional()
  @IsNumber({}, { message: 'articleId必须是number' })
  override articleId?: number | null;

  // ---------------- 二级评论 ----------------
  @ApiProperty({ description: '被回复的评论的id', example: '', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'parentId必须是数字' })
  override parentId?: number;

  @ApiProperty({ description: '回复id', example: '', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'replyId必须是数字' })
  override replyId?: number;
  // ---------------- 二级评论 ----------------

  // ---------------- 注册用户 ----------------
  // 不使用前端传的，传了也不用
  @ApiProperty({ description: '评论人id', example: '', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'userId必须是数字' })
  override userId?: number;
  // ---------------- 注册用户 ----------------

  // ---------------- 游客 ----------------
  // 不用前端传
  /* @ApiProperty({ description: '游客ip', example: '' })
  @ValidateIf((o: CreateCommentDto) => !o.userId)
  @IsNotEmpty({ message: '游客ip不能为空' })
  touristIp: string; */

  @ApiProperty({ description: '游客名', example: '', required: false })
  @ValidateIf((o: CreateCommentDto) => !o.userId)
  @IsNotEmpty({ message: '游客名不能为空' })
  @MaxLength(24, { message: '游客名长度不能超过24' })
  @Validate(WordValidate)
  override touristName?: string;

  @ApiProperty({ description: '游客邮箱', example: '', required: false })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  override touristEmail?: string;

  @ApiProperty({ description: 'scope', example: '', required: false })
  @IsOptional()
  @IsString({ message: 'scope必须时字符串' })
  @MaxLength(255, { message: 'scope最大长度为255' })
  override scope?: string;
}
