import { IsNotEmpty, IsString } from 'class-validator';
import { BaseDto } from '../base.dto';
import { Transform } from 'class-transformer';

export class CreateRtcDto extends BaseDto<CreateRtcDto> {
  @IsNotEmpty()
  @IsString()
  @Transform((params) => params.value && params.value.trim())
  token!: string;

  @IsNotEmpty()
  candidates!: RTCIceCandidateInit[];

  @IsNotEmpty()
  description!: RTCSessionDescriptionInit;
}
