import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from '@/common/dto/base.dto';

export class CreateTagDto extends BaseDto<CreateTagDto> {
  @ApiProperty({ description: '标签名', example: 'Typescript' })
  @IsNotEmpty({ message: '标签名不能为空' })
  @Length(2, 24, { message: '标签名长度必须在2-24之间' })
  @IsString({ message: '标签名必须是字符串' })
  name!: string;

  @ApiProperty({ description: '标签名描述', example: 'Javascript超集' })
  @IsString({ message: '标签名描述必须是字符串' })
  @Length(2, 255, { message: '标签名描述长度必须在2-255之间' })
  description!: string;
}
