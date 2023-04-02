import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseDto } from '../base.dto';

export class CreateOpenaiChatDto extends BaseDto<CreateOpenaiChatDto> {
  @ApiProperty({ description: '询问', example: '你好' })
  @IsNotEmpty({ message: 'text不能为空' })
  @IsString({ message: 'text必须是字符串' })
  text!: string;
}
