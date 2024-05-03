import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FRIEND_LINK_STATE } from '@blog/entities';

export class FindAllFriendLinkDto {
  @ApiProperty({ description: '状态', example: '状态' })
  @IsIn(
    ['', FRIEND_LINK_STATE.padding, FRIEND_LINK_STATE.resolve, FRIEND_LINK_STATE.reject].map((i) =>
      String(i),
    ),
  )
  status!: string;
}
