import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CreateTagDto {
  @ApiProperty({
    description: '标签名',
    example: 'name',
    required: true,
  })
  @IsNotEmpty({ message: '标签名不能为空' })
  @Expose()
  name!: string;

  @ApiProperty({
    description: '标签描述',
    example: 'desc',
    required: false,
  })
  @Expose()
  description!: string;
}
