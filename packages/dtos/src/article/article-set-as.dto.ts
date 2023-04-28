import { IsString, MaxLength } from 'class-validator';

export class ArticleSetAsDto {
  @MaxLength(80, { message: 'as最大长度为80' })
  @IsString({ message: 'as必须是字符串' })
  as!: string;
}
