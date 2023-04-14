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
  createdByUser:
    /\{"code":201,"msg":"Success","data":\{"article":\{"id":\d+},"articleId":\d,"user":{"id":\d},"userId":\d,"content":"[^"]+","deletedAt":null,"isTop":null,"parentId":null,"replyId":null,"replyUserId":null,"touristIp":null,"touristName":null,"id":\d,"createAt":"[^"]{24}","updateAt":"[^"]{24}"}}/,
  createdByTourist:
    // '{"code":201,"msg":"Success","data":{"article":{"id":1},"articleId":1,     "touristIp":"127.0.0.1","touristName":"tourist","content":"hello world","deletedAt":null,"isTop":null,"parentId":null,"replyId":null,"replyUserId":null,"userId":null,"id":2,"createAt":"2023-04-01T23:26:31.000Z","updateAt":"2023-04-01T23:26:31.000Z"}}'
    ///\{"code":201,"msg":"Success","data":\{"article":\{"id":\d+},"articleId":\d,"touristIp":"127.0.0.1","touristName":"tourist","content":"[^"]+",      "deletedAt":null,"isTop":null,"parentId":null,"replyId":null,"replyUserId":null,"id":\d,"createAt":"[^"]{24}","updateAt":"[^"]{24}"}}/
    /\{"code":201,"msg":"Success","data":\{"article":\{"id":\d+},"articleId":\d,"touristIp":"127\.0\.0\.1","touristName":"你好啊","content":"[^"]+","deletedAt":null,"isTop":null,"parentId":null,"replyId":null,"replyUserId":null,"userId":null,"id":\d,"createAt":"[^"]{24}","updateAt":"[^"]{24}"}}/,
  emptyList: '{"code":200,"msg":"Success","data":{"list":[],"count":0}}',
};
