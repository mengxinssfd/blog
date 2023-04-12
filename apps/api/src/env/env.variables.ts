import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class EnvironmentVariables {
  @IsNumber()
  PORT!: number;

  // mysql 配置
  @IsNumber()
  MYSQL_PORT!: number;
  @IsString()
  MYSQL_HOST!: string;
  @IsString()
  MYSQL_USERNAME!: string;
  @IsString()
  MYSQL_PASSWORD!: string;
  @IsString()
  MYSQL_DATABASE!: string;

  // root账户配置
  @IsString()
  ROOT_USERNAME!: string;
  @IsString()
  ROOT_PASSWORD!: string;

  // 小程序登录配置
  @IsString()
  MINI_PROGRAM_APPID!: string;
  @IsString()
  MINI_PROGRAM_SECRET!: string;

  // openai配置
  @IsString()
  OPENAI_API_KEY!: string;

  //
  @IsString()
  OSS_REGION!: string;
  @IsString()
  OSS_ACCESS_KEY_ID!: string;
  @IsString()
  OSS_ACCESS_KEY_SECRET!: string;
  @IsString()
  OSS_BUCKET!: string;
  @IsBoolean()
  OSS_CNAME!: boolean;
  @IsString()
  OSS_ENDPOINT!: string;
}
