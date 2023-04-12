import { IsOptional } from '../utils';
import { IsString } from 'class-validator';

export class CreateFileDto {
  @IsOptional()
  @IsString()
  timeStampName?: string;
}
