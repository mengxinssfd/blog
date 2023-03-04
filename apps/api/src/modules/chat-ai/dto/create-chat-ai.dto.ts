import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseDto } from '@/common/dto/base.dto';

export class CreateChatAiDto extends BaseDto<CreateChatAiDto> {
  @ApiProperty({ description: '询问', example: '你好' })
  @IsNotEmpty({ message: 'text不能为空' })
  @IsString({ message: 'text必须是字符串' })
  text!: string;
}
