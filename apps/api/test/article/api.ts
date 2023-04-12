import { SuperTest, Test } from 'supertest';
import { CreateArticleDto, UpdateArticleDto } from '@blog/dtos';
import * as CateApi from '../category/api';
import * as TagApi from '../tag/api';

export const prefix = '/api/article';

export function useApi(request: () => SuperTest<Test>) {
  const cateApi = CateApi.cateApi(request);
  const tagApi = TagApi.tagApi(request);
  const result = {
    create(data: CreateArticleDto, token: string) {
      return request()
        .post(prefix)
        .send(data)
        .set('authorization', 'Bearer ' + token);
    },
    update(id: number, data: UpdateArticleDto, token: string) {
      return request()
        .patch(prefix + '/' + id)
        .send(data)
        .set('authorization', 'Bearer ' + token);
    },
    get(id: number, token?: string) {
      return request()
        .get(prefix + '/' + id)
        .set('authorization', 'Bearer ' + token);
    },
    list(token?: string) {
      return request()
        .get(prefix)
        .set('authorization', 'Bearer ' + token)
        .query({ sort: 3 });
    },
    delete(id: number, token: string) {
      return request()
        .delete(prefix + '/' + id)
        .set('authorization', 'Bearer ' + token);
    },
    async createArticles(token: string) {
      const articleInfo: CreateArticleDto = {
        title: '测试一些',
        description: '测试一下',
        content: '#测试一下',
        categoryId: 0,
        tags: [],
        isPublic: true,
      };
      const frontCate = { name: 'Front Dev', description: '前端开发' };
      const tsTag = { name: 'Typescript', description: 'Javascript超类' };

      articleInfo.categoryId = await cateApi
        .create(frontCate, token)
        .then<number>((res) => res.body.data.id);

      articleInfo.tags.push(
        await tagApi
          .create(tsTag, token)
          .expect(TagApi.TagResTypes.created)
          .then<number>((res) => res.body.data.id),
      );

      const publicArticleId = await result
        .create(articleInfo, token)
        .expect(ResType.created)
        .then<number>((res) => res.body.data.id);

      articleInfo.isPublic = false;
      const privateArticleId = await result
        .create(articleInfo, token)
        .expect(ResType.created)
        .then<number>((res) => res.body.data.id);

      expect(typeof publicArticleId).toBe('number');
      expect(typeof privateArticleId).toBe('number');

      return { publicArticleId, privateArticleId };
    },
  };
  return result;
}

export const ResType = {
  notFound: '{"code":404,"msg":"文章不存在"}',
  isExists: /\{"code":403,"msg":"标签'[^']+'已存在"}/,
  created: /\{"code":201,"msg":"Success","data":\{"id":\d+}}/,
  emptyList: '{"code":200,"msg":"Success","data":{"list":[],"count":0}}',
};
