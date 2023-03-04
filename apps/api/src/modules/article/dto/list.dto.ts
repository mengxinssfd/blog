import { ApiProperty } from '@nestjs/swagger';
import { PageDto } from '@/common/dto/page.dto';
import { Transform } from 'class-transformer';
import { castArray } from '@tool-pack/basic';
import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class ListDTO extends PartialType(PageDto) {
  constructor(options?: Partial<ListDTO>) {
    super(options);
  }

  @ApiProperty({ description: '搜索关键词', example: '', required: false })
  @IsOptional()
  @IsString({ message: '关键词必须是字符串' })
  readonly keyword?: string;

  @ApiProperty({ description: '排序方式', example: '', required: false })
  @IsOptional()
  @IsNumber(undefined, { message: '排序方式必须是数字' })
  readonly sort?: number;

  @ApiProperty({ description: '标签', example: '', required: false })
  @Transform((params) => {
    return castArray(params.value)
      .filter(Boolean)
      .map((v: string) => Number(v));
  })
  @IsOptional()
  @IsArray({ message: '标签必须是数组' })
  readonly tags!: number[];

  @ApiProperty({ description: '分类', example: '', required: false })
  @IsOptional()
  @IsNumber(undefined, { message: '分类必须是数字' })
  readonly category?: number;
}
