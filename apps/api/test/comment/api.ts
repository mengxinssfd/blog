import { SuperTest, Test } from 'supertest';
import { PageDto } from '@blog/dtos/page.dto';
import { CreateCommentDto } from '@blog/dtos';
// import { CreateArticleDto, UpdateArticleDto } from '@blog/dtos';
// import { buildRegisterData } from '../user/utils';
// import * as CateApi from '../category/api';
// import * as TagApi from '../tag/api';

export const prefix = '/api/comment';

export function useApi(request: () => SuperTest<Test>) {
  return {
    getMyAll(token: string, page?: Partial<PageDto>) {
      return request()
        .get(prefix + '/my')
        .query(page as Record<string, any>)
        .set('authorization', 'Bearer ' + token);
    },
    getReplyMeAll(token: string) {
      return request()
        .get(prefix + '/reply')
        .set('authorization', 'Bearer ' + token);
    },
    getAll(token: string, page?: Partial<PageDto>) {
      return request()
        .get(prefix)
        .query(page as Record<string, any>)
        .set('authorization', 'Bearer ' + token);
    },
    create(data: CreateCommentDto, token?: string) {
      return request()
        .post(prefix)
        .set('authorization', 'Bearer ' + token)
        .send(data);
    },
    get(id: number, token?: string) {
      return request()
        .get(prefix + '/' + id)
        .set('authorization', 'Bearer ' + token);
    },
    getByArticleId(articleId: number, token?: string) {
      return request()
        .get(prefix + '/article/' + articleId)
        .set('authorization', 'Bearer ' + token);
    },
    list(token?: string) {
      return request()
        .get(prefix)
        .set('authorization', 'Bearer ' + token);
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
  notFound: '{"code":403,"msg":"文章不存在"}',
  isExists: /\{"code":403,"msg":"标签'[^']+'已存在"}/,
  created: /\{"code":201,"msg":"Success"}/,
  emptyList: '{"code":200,"msg":"Success","data":{"list":[],"count":0}}',
};
