import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from '../base.dto';

export class WxLoginDTO extends BaseDto<WxLoginDTO> {
  // @ApiProperty({
  //   description: '微信小程序用户加密信息，从wx.getUserProfile()处获取',
  //   example: '',
  // })
  // @IsNotEmpty({ message: 'encryptedData不能为空' })
  // @Expose()
  // readonly encryptedData!: string;

  @ApiProperty({
    description: '微信小程序用户信息，从wx.getUserProfile()处获取',
    example: '',
  })
  @IsNotEmpty({ message: 'nickName不能为空' })
  @IsString({ message: 'nickName必须是字符串' })
  readonly nickName!: string;

  @ApiProperty({
    description: '微信小程序用户信息，从wx.getUserProfile()处获取',
    example: '',
  })
  @IsNotEmpty({ message: 'avatarUrl不能为空' })
  @IsUrl(undefined, { message: 'avatarUrl必须是链接' })
  @IsString({ message: 'avatarUrl必须是字符串' })
  readonly avatarUrl!: string;

  // @ApiProperty({
  //   description: '微信小程序用户加密信息，从wx.getUserProfile()处获取',
  //   example: '',
  // })
  // @IsNotEmpty({ message: 'iv不能为空' })
  // @Expose()
  // readonly iv!: string;

  @ApiProperty({
    description: '获取用户openid用，从wx.login()处获取',
    example: '',
  })
  @IsNotEmpty({ message: 'code不能为空' })
  @IsString({ message: 'code必须是字符串' })
  readonly code!: string;
}
