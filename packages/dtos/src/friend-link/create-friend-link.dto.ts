import { IsNotEmpty, MaxLength, IsUrl, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFriendLinkDto {
  @ApiProperty({ description: '站名', example: '站名' })
  @MaxLength(20, { message: '站名最大长度为20' })
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: '描述', example: '描述' })
  @IsOptional()
  @MaxLength(254, { message: '描述最大长度为254' })
  desc?: string;

  @ApiProperty({ description: '链接', example: '链接' })
  @MaxLength(254, { message: '链接最大长度为254' })
  @IsUrl({}, { message: 'link必须是url' })
  @IsNotEmpty()
  link!: string;

  @ApiProperty({ description: '头像', example: '头像' })
  @IsOptional()
  @MaxLength(500, { message: '头像最大长度为500' })
  @IsUrl({}, { message: 'avatar必须是url' })
  avatar?: string;
}
