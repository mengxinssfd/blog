import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FriendLinkState } from '@blog/entities';

export class FindAllFriendLinkDto {
  @ApiProperty({ description: '状态', example: '状态' })
  @IsIn(
    ['', FriendLinkState.padding, FriendLinkState.resolve, FriendLinkState.reject].map((i) =>
      String(i),
    ),
  )
  status!: string;
}
