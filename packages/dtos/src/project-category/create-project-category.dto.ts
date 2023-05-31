import { PartialType } from '@nestjs/mapped-types';
import { ProjectCategoryEntity } from '@blog/entities';
import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from '../utils';

export class CreateProjectCategoryDto extends PartialType(ProjectCategoryEntity) {
  @ApiProperty({ description: '分类名', example: 'Typescript' })
  @IsNotEmpty({ message: '名称不能为空' })
  @Length(2, 24, { message: '名称长度必须在2-24之间' })
  @IsString({ message: '名称必须是字符串' })
  override name!: string;

  @ApiProperty({ description: '分类描述', example: 'Javascript超集' })
  @IsOptional()
  @IsString({ message: '分类描述必须是字符串' })
  @Length(2, 255, { message: '分类描述长度必须在2-255之间' })
  override desc?: string;

  @ApiProperty({ description: '权重', example: 0 })
  @IsOptional()
  @IsNumber(undefined, { message: '权重必须是数字' })
  override weights?: number;
}
