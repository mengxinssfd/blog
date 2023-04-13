import { IsNotEmpty, MaxLength, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFriendLinkDto {
  @ApiProperty({ description: '链接', example: '链接' })
  @MaxLength(254, { message: '链接最大长度为254' })
  @IsUrl({}, { message: 'link必须是url' })
  @IsNotEmpty()
  link!: string;
}
