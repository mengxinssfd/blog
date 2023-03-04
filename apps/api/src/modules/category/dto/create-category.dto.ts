import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from '@/common/dto/base.dto';

export class CreateCategoryDto extends BaseDto<CreateCategoryDto> {
  @ApiProperty({ description: '分类名', example: 'Typescript' })
  @IsNotEmpty({ message: '名称不能为空' })
  @Length(2, 24, { message: '名称长度必须在2-24之间' })
  @IsString({ message: '名称必须是字符串' })
  name!: string;

  @ApiProperty({ description: '分类描述', example: 'Javascript超集' })
  @IsString({ message: '分类描述必须是字符串' })
  @Length(2, 255, { message: '分类描述长度必须在2-255之间' })
  description!: string;
}
