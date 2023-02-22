import { SuperTest, Test } from 'supertest';
import type { CreateCategoryDto } from '@/modules/category/dto/create-category.dto';
import { UpdateCategoryDto } from '@/modules/category/dto/update-category.dto';

export const prefix = '/api/category';

export function cateApi(request: () => SuperTest<Test>) {
  return {
    create(data: CreateCategoryDto, token: string) {
      return request()
        .post(prefix)
        .send(data)
        .set('authorization', 'Bearer ' + token);
    },
    update(id: number, data: UpdateCategoryDto, token: string) {
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

export const CateResTypes = {
  notFound: '{"code":404,"msg":"该分类不存在"}',
  isExists: /\{"code":403,"msg":"分类'[^']+'已存在"}/,
  created: /\{"code":201,"msg":"Success","data":\{"id":\d+}}/,
};
