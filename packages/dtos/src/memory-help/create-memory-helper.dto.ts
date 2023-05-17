import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, MaxLength } from 'class-validator';
import { MEMORY_STATUS, MemoryHelperEntity } from '@blog/entities';
import { getNumericEnumValues, IsOptional } from '../utils';

export class CreateMemoryHelperDto extends MemoryHelperEntity {
  @ApiProperty({ description: '标题', example: 'title hello world' })
  @MaxLength(100, { message: '标题最大长度为100' })
  @IsNotEmpty({ message: '标题不能为空' })
  override title!: string;

  @ApiProperty({ description: '描述', example: 'desc hello world' })
  @MaxLength(500, { message: '描述最大长度为500' })
  override desc?: string;

  @ApiProperty({ description: '内容', example: 'content hello world' })
  @IsNotEmpty({ message: '内容不能为空' })
  override questionJson!: string;

  @IsOptional()
  @IsEnum(MEMORY_STATUS, {
    message: `status必须在${JSON.stringify(getNumericEnumValues(MEMORY_STATUS))}之中`,
  })
  override status!: MEMORY_STATUS;
}
