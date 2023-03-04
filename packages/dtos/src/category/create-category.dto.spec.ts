import { CreateCategoryDto } from './create-category.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('CreateCategoryDto', () => {
  it('should be defined', () => {
    expect(new CreateCategoryDto()).toBeDefined();
  });

  it('should validate correctly', async () => {
    const dto = new CreateCategoryDto();
    const ins = plainToInstance(CreateCategoryDto, dto);
    const errors = await validate(ins);
    expect(errors).toEqual([
      {
        children: [],
        constraints: {
          isLength: '名称长度必须在2-24之间',
          isNotEmpty: '名称不能为空',
          isString: '名称必须是字符串',
        },
        property: 'name',
        target: {},
      },
      {
        children: [],
        constraints: {
          isLength: '分类描述长度必须在2-255之间',
          isString: '分类描述必须是字符串',
        },
        property: 'description',
        target: {},
      },
    ]);
  });
});
