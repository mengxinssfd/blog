import { ApiProperty } from '@nestjs/swagger';

export class CreateTestModDto {
  @ApiProperty({ description: '描述', example: 'test' })
  desc!: string;
}
