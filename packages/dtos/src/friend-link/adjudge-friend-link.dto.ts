import { IsNotEmpty, MaxLength, ValidateIf, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FRIEND_LINK_STATE } from '@blog/entities';

export class AdjudgeFriendLinkDto {
  @ApiProperty({ description: '状态', example: '站名' })
  @IsNotEmpty()
  @IsEnum(FRIEND_LINK_STATE)
  status!: number;

  @ApiProperty({ description: '拒绝原因', example: '拒绝原因' })
  @ValidateIf((o: AdjudgeFriendLinkDto) => o.status === FRIEND_LINK_STATE.reject)
  @IsNotEmpty()
  @MaxLength(200, { message: '拒绝理由最大长度为200' })
  rejectReason?: string;
}
