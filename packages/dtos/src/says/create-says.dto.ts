import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, Validate } from 'class-validator';
import { WordValidate } from '../word.validate';
import { getNumericEnumValues, IsOptional } from '../utils';
import { PartialType } from '@nestjs/mapped-types';
import { SaysEntity, SaysStatus } from '@blog/entities';
import { Type } from 'class-transformer';

export class CreateSaysDto extends PartialType(SaysEntity) {
  @ApiProperty({ description: '说说内容', example: '' })
  @IsNotEmpty({ message: '说说内容不能为空' })
  @IsString({ message: '内容必须是字符串' })
  override content!: string;

  @ApiProperty({ description: '评论内容', example: '' })
  @IsOptional()
  @IsEnum(SaysStatus, { message: '状态必须是' + getNumericEnumValues(SaysStatus) + '其中之一' })
  @Validate(WordValidate)
  override status?: SaysStatus;

  @ApiProperty({ description: '评论内容', example: '' })
  @IsOptional()
  @Type(() => Date)
  override expires?: Date;
}
