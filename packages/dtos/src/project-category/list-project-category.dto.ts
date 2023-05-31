import { IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from '../utils';
import { Transform } from 'class-transformer';

export class ListProjectCategoryDto {
  @ApiPropertyOptional({ description: '为true时带上projectList', default: false })
  @IsOptional()
  @IsBoolean({ message: 'pure必须是boolean类型字符串' })
  @Transform((params) => {
    return (
      ({ true: true, false: false, '': false } as Record<string, boolean>)[params.value] ??
      params.value
    );
  })
  pure?: boolean;
}
