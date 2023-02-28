import { SuperTest, Test } from 'supertest';
import { CreateArticleDto } from '@/modules/article/dto/create-article.dto';
import { UpdateArticleDto } from '@/modules/article/dto/update-article.dto';
// import { buildRegisterData } from '../user/utils';
// import * as CateApi from '../category/api';
// import * as TagApi from '../tag/api';

export const prefix = '/api/article';

export function useApi(request: () => SuperTest<Test>) {
  return {
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
    list() {
      return request().get(prefix);
    },
    delete(id: number, token: string) {
      return request()
        .delete(prefix + '/' + id)
        .set('authorization', 'Bearer ' + token);
    },
    // async createArticles(token:string){
    //   const articleInfo: CreateArticleDto = {
    //     title: '测试一些',
    //     description: '测试一下',
    //     content: '#测试一下',
    //     categoryId: 0,
    //     tags: [],
    //     bgm: '',
    //     isPublic: false,
    //     cover: '',
    //   };
    //   let privateArticleId = 0;
    //   let publicArticleId = 0;
    //   const tsStr = JSON.stringify(articleInfo);
    //   let adminUser: ReturnType<typeof buildRegisterData> & { id: number; token: string };
    //   const frontCate = { name: 'Front Dev', description: '前端开发' };
    //   const tsTag = { name: 'Typescript', description: 'Javascript超类' };
    //   const jsTag = { name: 'Javascript', description: 'Javascript脚本' };
    //
    //
    //
    // }
  };
}

export const ResType = {
  notFound: '{"code":404,"msg":"文章不存在"}',
  isExists: /\{"code":403,"msg":"标签'[^']+'已存在"}/,
  created: /\{"code":201,"msg":"Success","data":\{"articleId":\d+}}/,
  emptyList: '{"code":200,"msg":"Success","data":{"list":[],"count":0}}',
};
