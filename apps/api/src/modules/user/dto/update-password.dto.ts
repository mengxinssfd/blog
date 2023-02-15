import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength, Equals, ValidateIf } from 'class-validator';
import { Expose } from 'class-transformer';

export class UpdatePasswordDto {
  @ApiProperty({ example: '123456' })
  @IsNotEmpty({ message: '密码不能为空' })
  @Expose()
  readonly curPassword!: string;

  @ApiProperty({ example: '123456' })
  @MinLength(6, { message: '密码不能少于6位' })
  @IsNotEmpty({ message: '密码不能为空' })
  @Expose()
  readonly password!: string;

  @ApiProperty({ example: '123456' })
  @Expose()
  @ValidateIf((o: UpdatePasswordDto) => o.password !== o.rePassword)
  @Equals(() => false, { message: '两次输入密码不一致' })
  readonly rePassword!: string;
}
