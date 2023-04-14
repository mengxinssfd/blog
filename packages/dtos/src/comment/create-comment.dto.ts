import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
  ValidateIf,
} from 'class-validator';
import { WordValidate } from '../word.validate';

export class CreateCommentDto {
  @ApiProperty({ description: '评论内容', example: '' })
  @IsNotEmpty({ message: '评论内容不能为空' })
  @IsString({ message: '内容必须是字符串' })
  @Validate(WordValidate)
  content!: string;

  @ApiProperty({ description: '文章id', example: '' })
  @IsNotEmpty({ message: '文章id不能为空' })
  @IsNumber({}, { message: 'articleId必须是number' })
  articleId!: number;

  // ---------------- 二级评论 ----------------
  @ApiProperty({ description: '被回复的评论的id', example: '', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'parentId必须是数字' })
  parentId?: number;

  @ApiProperty({ description: '回复id', example: '', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'replyId必须是数字' })
  replyId?: number;
  // ---------------- 二级评论 ----------------

  // ---------------- 注册用户 ----------------
  // 不使用前端传的，传了也不用
  @ApiProperty({ description: '评论人id', example: '', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'userId必须是数字' })
  userId?: number;
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
  touristName?: string;
}
