import { IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from '../base.dto';

export class MuteDto extends BaseDto<MuteDto> {
  @ApiProperty({ description: '禁言', example: true })
  @IsBoolean({ message: 'mute必须是Boolean类型' })
  @IsNotEmpty({ message: 'mute状态不能为空' })
  readonly mute!: boolean;
}
