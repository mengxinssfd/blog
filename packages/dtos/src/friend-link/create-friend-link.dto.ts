import { IsNotEmpty, MaxLength, IsUrl, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { FriendLinkEntity } from '@blog/entities';
import { IsOptional } from '../utils';

export class CreateFriendLinkDto extends PartialType(FriendLinkEntity) {
  @ApiProperty({ description: '链接', example: '链接' })
  @MaxLength(254, { message: '链接最大长度为254' })
  @IsUrl({}, { message: 'link必须是url' })
  @IsNotEmpty()
  override link!: string;

  @ApiProperty({ description: '邮箱', example: '', required: false })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  override email?: string;
}
