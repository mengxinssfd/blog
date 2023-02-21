import { IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: '分类名', example: 'Typescript' })
  @IsNotEmpty({ message: '名称不能为空' })
  @Expose()
  name!: string;

  @ApiProperty({ description: '分类描述', example: 'Javascript超集' })
  @Expose()
  description!: string;
}
