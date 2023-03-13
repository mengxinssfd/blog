import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { BaseDto } from './base.dto';

export class PageDto extends BaseDto<PageDto> {
  @ApiProperty({ description: '页码', example: 1 })
  @IsOptional()
  @Min(1, { message: 'page最小值为1' })
  @IsNumber()
  @Transform((params) => {
    console.log('tttttt', params);
    return params.value === undefined ? 1 : Number(params.value);
  })
  page = 1;

  @ApiProperty({ description: '每页数量', example: 10 })
  @IsOptional()
  @Max(20, { message: 'pageSize最大值为20' })
  @Min(1, { message: 'pageSize最小值为1' })
  @IsNumber()
  @Transform((params) => {
    console.log('tttttttt', params);
    return params.value === undefined ? 10 : Number(params.value);
  })
  pageSize = 10;
}
