import { IsNotEmpty, MaxLength, IsUrl, IsString, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectEntity, ProjectStatus } from '@blog/entities';
import { PartialType } from '@nestjs/mapped-types';
import { getNumericEnumValues, IsOptional } from '../utils';
import { Transform } from 'class-transformer';

export class CreateProjectDto extends PartialType(ProjectEntity) {
  @ApiProperty({ description: '项目链接', example: '链接' })
  @IsOptional()
  @MaxLength(254, { message: '链接最大长度为254' })
  @IsUrl({}, { message: '项目链接必须是url' })
  @IsNotEmpty()
  override link!: string;

  @ApiProperty({ description: '项目封面', example: '项目封面' })
  @MaxLength(500, { message: '项目封面最大长度为500' })
  @IsUrl({}, { message: '项目封面必须是url' })
  override cover!: string;

  @ApiProperty({ description: '项目名称', example: '项目名称' })
  @MaxLength(100, { message: '项目名称最大长度为100' })
  @IsString({ message: '项目名称必须是字符串' })
  @IsNotEmpty()
  override name!: string;

  @ApiPropertyOptional({ description: '项目描述', example: '项目描述' })
  @IsOptional()
  @MaxLength(500, { message: '项目描述最大长度为500' })
  @IsString()
  override desc?: string;

  @ApiProperty({ description: '项目状态', example: '项目状态' })
  @IsEnum(ProjectEntity.STATUS, {
    message: `项目状态必须是[${getNumericEnumValues(ProjectEntity.STATUS).join(',')}]之一`,
  })
  @IsNotEmpty()
  override status!: ProjectStatus;

  @ApiPropertyOptional({ description: '项目转移处', example: '项目转移处' })
  @IsOptional()
  @MaxLength(500, { message: '转移到最大长度为500' })
  @IsString({ message: '转移处必须是字符串' })
  override transferredTo?: string;

  @ApiPropertyOptional({ description: '技术栈', example: '技术栈' })
  @IsOptional()
  @MaxLength(500, { message: '技术栈最大长度为500' })
  @IsString({ message: '技术栈必须是字符串' })
  override techStack?: string;

  @ApiPropertyOptional({ description: '权重', example: 0 })
  @IsOptional()
  @IsNumber({}, { message: '权重必须是数字' })
  override weights?: number;

  @ApiPropertyOptional({ description: '开始时间', example: '2023/05/14 11:10:00' })
  @IsNotEmpty({ message: '开始时间不能为空' })
  @Transform((v) => new Date(v.value))
  override startTime!: Date;

  @ApiPropertyOptional({ description: '结束时间', example: '2023/05/14 11:10:00' })
  @IsOptional()
  @Transform((v) => {
    return v.value ? new Date(v.value) : null;
  })
  override endTime?: Date | null;

  @ApiPropertyOptional({ description: '分类id', example: 1 })
  @IsOptional()
  @IsNumber(undefined, { message: '分类id必须是数字' })
  override categoryId?: number;
}
