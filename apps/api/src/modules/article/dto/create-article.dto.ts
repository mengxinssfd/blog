import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, ValidateIf } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateArticleDto {
  @ApiProperty({ description: '标题', example: 'title hello world' })
  @MaxLength(254, { message: '标题最大长度为254' })
  @IsNotEmpty({ message: '标题不能为空' })
  @Expose()
  title!: string;

  @ApiProperty({ description: '描述', example: 'desc hello world' })
  @MaxLength(254, { message: '描述最大长度为254' })
  @IsNotEmpty({ message: '描述不能为空' })
  @Expose()
  description!: string;

  @ApiProperty({ description: '内容', example: 'content hello world' })
  @IsNotEmpty({ message: '内容不能为空' })
  @Expose()
  content!: string;

  @ApiProperty({ description: '分类', example: '1' })
  @IsNotEmpty({ message: '分类不能为空' })
  @Expose()
  categoryId!: number;

  @Expose()
  tags!: number[];

  @ValidateIf((o: CreateArticleDto) => Boolean(o.bgm))
  @MaxLength(500, { message: '背景音乐链接最大长度为500' })
  @Expose()
  bgm!: string;

  @ValidateIf((o: CreateArticleDto) => Boolean(o.bgm))
  @MaxLength(500, { message: '封面链接最大长度为500' })
  @Expose()
  cover!: string;

  @Expose()
  isPublic?: boolean;
}
