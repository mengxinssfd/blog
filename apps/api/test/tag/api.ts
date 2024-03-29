import { SuperTest, Test } from 'supertest';
import { CreateTagDto, UpdateTagDto } from '@blog/dtos';

export const prefix = '/api/tag';

export function tagApi(request: () => SuperTest<Test>) {
  return {
    create(data: CreateTagDto, token: string) {
      return request()
        .post(prefix)
        .send(data)
        .set('authorization', 'Bearer ' + token);
    },
    update(id: number, data: UpdateTagDto, token: string) {
      return request()
        .patch(prefix + '/' + id)
        .send(data)
        .set('authorization', 'Bearer ' + token);
    },
    get(id: number) {
      return request().get(prefix + '/' + id);
    },
    list() {
      return request().get(prefix);
    },
    delete(id: number, token: string) {
      return request()
        .delete(prefix + '/' + id)
        .set('authorization', 'Bearer ' + token);
    },
  };
}

export const TagResTypes = {
  notFound: '{"code":404,"msg":"该标签不存在"}',
  isExists: /\{"code":403,"msg":"标签'[^']+'已存在"}/,
  created: /\{"code":201,"msg":"Success","data":\{"id":\d+}}/,
};
