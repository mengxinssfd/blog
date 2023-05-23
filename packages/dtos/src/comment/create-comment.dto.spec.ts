import { CreateCommentDto } from './create-comment.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('CreateCommentDto', function () {
  test('base', async () => {
    const dto = new CreateCommentDto();

    expect(await validate(plainToInstance(CreateCommentDto, dto))).toEqual([
      {
        children: [],
        constraints: {
          isNotEmpty: '评论内容不能为空',
          isString: '内容必须是字符串',
          maxLength: '评论内容不能超过800',
        },
        property: 'content',
        target: {},
      },
      {
        children: [],
        constraints: {
          isNotEmpty: '游客名不能为空',
          maxLength: '游客名长度不能超过24',
        },
        property: 'touristName',
        target: {},
      },
    ]);

    dto.articleId = null;

    expect(await validate(plainToInstance(CreateCommentDto, dto))).toEqual([
      {
        children: [],
        constraints: {
          isNotEmpty: '评论内容不能为空',
          isString: '内容必须是字符串',
          maxLength: '评论内容不能超过800',
        },
        property: 'content',
        target: {
          articleId: null,
        },
      },
      {
        children: [],
        constraints: {
          isNotEmpty: '游客名不能为空',
          maxLength: '游客名长度不能超过24',
        },
        property: 'touristName',
        target: {
          articleId: null,
        },
      },
    ]);
  });
});
