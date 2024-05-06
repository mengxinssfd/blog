import { IsNotEmpty, IsString } from 'class-validator';
import { BaseDto } from '../base.dto';

export class CreateRtcDto extends BaseDto<CreateRtcDto> {
  @IsNotEmpty()
  @IsString()
  token!: string;

  @IsNotEmpty()
  @IsString()
  candidate!: string;
}
