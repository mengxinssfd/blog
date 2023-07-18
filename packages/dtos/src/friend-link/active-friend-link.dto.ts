import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActiveFriendLinkDto {
  @ApiProperty({ description: '活动状态', example: true })
  @IsNotEmpty()
  @IsBoolean({ message: 'active必须是boolean' })
  active!: boolean;
}
