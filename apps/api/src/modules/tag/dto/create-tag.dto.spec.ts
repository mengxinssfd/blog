import { CreateTagDto } from '@/modules/tag/dto/create-tag.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('CreateTagDto', () => {
  it('should be defined', () => {
    expect(new CreateTagDto()).toBeDefined();
  });

  it('should validate correctly', async () => {
    const dto = new CreateTagDto();
    const ins = plainToInstance(CreateTagDto, dto);
    const errors = await validate(ins);
    expect(errors).toEqual([
      {
        children: [],
        constraints: {
          isLength: '标签名长度必须在2-24之间',
          isNotEmpty: '标签名不能为空',
          isString: '标签名必须是字符串',
        },
        property: 'name',
        target: {},
      },
      {
        children: [],
        constraints: {
          isLength: '标签名描述长度必须在2-255之间',
          isString: '标签名描述必须是字符串',
        },
        property: 'description',
        target: {},
      },
    ]);
  });
});
