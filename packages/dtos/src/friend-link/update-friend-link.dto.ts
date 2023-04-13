import { PartialType } from '@nestjs/mapped-types';
import { CreateFriendLinkDto } from './create-friend-link.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl, MaxLength } from 'class-validator';
import { IsOptional } from '../utils';

export class UpdateFriendLinkDto extends PartialType(CreateFriendLinkDto) {
  @ApiProperty({ description: '站名', example: '站名' })
  @IsOptional()
  @MaxLength(20, { message: '站名最大长度为20' })
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ description: '描述', example: '描述' })
  @IsOptional()
  @MaxLength(254, { message: '描述最大长度为254' })
  desc?: string;

  @ApiProperty({ description: '头像', example: '头像' })
  @IsOptional()
  @MaxLength(500, { message: '头像最大长度为500' })
  @IsUrl({}, { message: 'avatar必须是url' })
  avatar?: string;
}
