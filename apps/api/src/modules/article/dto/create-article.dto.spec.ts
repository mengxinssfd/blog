import { CreateArticleDto } from '@/modules/article/dto/create-article.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('CreateCategoryDto', () => {
  it('should be defined', () => {
    expect(new CreateArticleDto()).toBeDefined();
  });

  it('should validate correctly', async () => {
    const dto = new CreateArticleDto();
    const ins = plainToInstance(CreateArticleDto, dto);
    const errors = await validate(ins);
    expect(errors).toEqual([
      {
        children: [],
        constraints: {
          isNotEmpty: '标题不能为空',
          isString: '标题必须是字符串',
          maxLength: '标题最大长度为254',
        },
        property: 'title',
        target: {},
      },
      {
        children: [],
        constraints: {
          isNotEmpty: '描述不能为空',
          isString: '描述必须是字符串',
          maxLength: '描述最大长度为254',
        },
        property: 'description',
        target: {},
      },
      {
        children: [],
        constraints: {
          isNotEmpty: '内容不能为空',
          isString: '内容必须是字符串',
        },
        property: 'content',
        target: {},
      },
      {
        children: [],
        constraints: {
          isNotEmpty: '分类不能为空',
          isNumber: 'categoryId必须是数字',
        },
        property: 'categoryId',
        target: {},
      },
      {
        children: [],
        constraints: {
          isArray: '标签必须是一个数组',
          isNotEmpty: '标签不能为空',
        },
        property: 'tags',
        target: {},
      },
      {
        children: [],
        constraints: {
          isNotEmpty: '封面不能为空',
          maxLength: '封面链接最大长度为500',
        },
        property: 'cover',
        target: {},
      },
    ]);
  });
});
