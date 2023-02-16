import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateChatAiDto {
  @ApiProperty({ description: '询问', example: '你好' })
  @IsNotEmpty({ message: 'text不能为空' })
  @Expose()
  readonly text!: string;
}
