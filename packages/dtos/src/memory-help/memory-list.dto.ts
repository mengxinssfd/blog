import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { PageDto } from '../page.dto';
import { MEMORY_STATUS } from '@blog/entities';
import { IsEnum, IsString } from 'class-validator';
import { getNumericEnumValues, IsOptional } from '../utils';

export class MemoryListDTO extends PartialType(PageDto) {
  @ApiProperty({ description: '搜索关键词', example: '', required: false })
  @IsOptional()
  @IsString({ message: '关键词必须是字符串' })
  readonly keyword!: string;

  @IsOptional()
  @IsEnum(MEMORY_STATUS, {
    message: `status必须在${JSON.stringify(getNumericEnumValues(MEMORY_STATUS))}之中`,
  })
  readonly status!: MEMORY_STATUS;
}
