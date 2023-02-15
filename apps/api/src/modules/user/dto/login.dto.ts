import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LoginInfoDTO {
  @ApiProperty({ description: '用户名', example: 'javascript' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @Expose()
  readonly username!: string;

  @ApiProperty({ description: '密码', example: '123456' })
  @IsNotEmpty({ message: '密码不能为空' })
  @Expose()
  readonly password!: string;
}

export class LoginResponseDTO {
  @ApiProperty({ description: 'code', example: 200 })
  code!: number;
  @ApiProperty({ description: 'data', example: { token: '' } })
  data!: {
    token: string;
  };
  @ApiProperty({ description: 'msg' })
  msg!: string;
}
