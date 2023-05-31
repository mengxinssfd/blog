import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CategoryEntity } from '@blog/entities';

export class CreateCategoryDto extends PartialType(CategoryEntity) {
  @ApiProperty({ description: '分类名', example: 'Typescript' })
  @IsNotEmpty({ message: '名称不能为空' })
  @Length(2, 24, { message: '名称长度必须在2-24之间' })
  @IsString({ message: '名称必须是字符串' })
  override name!: string;

  @ApiProperty({ description: '分类描述', example: 'Javascript超集' })
  @IsString({ message: '分类描述必须是字符串' })
  @Length(2, 255, { message: '分类描述长度必须在2-255之间' })
  override description!: string;
}
