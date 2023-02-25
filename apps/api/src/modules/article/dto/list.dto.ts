import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PageDto } from '@/common/dto/page.dto';
import { Expose, Transform } from 'class-transformer';
import { castArray } from '@tool-pack/basic';

export class ListDTO extends PartialType(PageDto) {
  @ApiProperty({ description: '搜索关键词', example: '', required: false })
  @Expose()
  readonly keyword!: string;

  @ApiProperty({ description: '排序方式', example: '', required: false })
  @Expose()
  readonly sort!: number;

  @ApiProperty({ description: '标签', example: '', required: false })
  @Transform((params) => {
    return castArray(params.value)
      .filter(Boolean)
      .map((v: string) => Number(v));
  })
  @Expose()
  readonly tag!: number[];

  @ApiProperty({ description: '分类', example: '', required: false })
  @Expose()
  readonly category!: number;
}
