import { buildApp, clearAllTables } from '../utils';
import { cateApi, CateResTypes } from './api';
import { ResTypes as UserResTypes } from '../user/utils';
import { userApi } from '../user/api';
import { ArticleEntity, UserEntity } from '@blog/entities';

describe('/category 文章分类', () => {
  const request = buildApp();
  const api = cateApi(request);
  const { createUsers, createAdmin } = userApi(request);

  const ts = { name: 'Typescript', description: 'Javascript超集' };
  const tsStr = JSON.stringify(ts);

  describe('创建', function () {
    it('需要登录', () => {
      return api.create(ts, '').expect(UserResTypes.unauthorized);
    });
    it('需要权限创建', async () => {
      const { commonUser } = await createUsers();
      await api.create(ts, commonUser.token).expect(UserResTypes['403']);
    });
    it('创建成功', async () => {
      const admin = await createAdmin();
      await api.create(ts, admin.token).expect(CateResTypes.created);
    });
    it('不得重复创建', async () => {
      const admin = await createAdmin();
      await api.create(ts, admin.token).expect(CateResTypes.created);
      await api.create(ts, admin.token).expect(CateResTypes.isExists);
    });
  });

  describe('根据id获取', function () {
    it('不存在该分类', async () => {
      await clearAllTables();
      return api.get(1).expect(CateResTypes.notFound);
    });
    it('成功获取分类', async () => {
      const { admin } = await createUsers();
      await api.create(ts, admin.token).expect(CateResTypes.created);
      return api
        .get(1)
        .expect(
          new RegExp(
            `\\{"code":200,"msg":"Success","data":\\{"id":1,${tsStr.slice(
              1,
              -1,
            )},"createBy":\\{"id":1,"nickname":"hello_\\d+","avatar":"${
              UserEntity.DEFAULT_AVATAR
            }"},"articleCount":0}}`,
          ),
        );
    });
  });

  describe('列表', function () {
    it('获取成功', () => {
      return api
        .list()
        .expect(
          `{"code":200,"msg":"Success","data":[{"id":1,${tsStr.slice(1, -1)},"articleCount":0}]}`,
        );
    });
    it('空列表', async () => {
      await clearAllTables();
      await api.list().expect('{"code":200,"msg":"Success","data":[]}');
    });
  });

  describe('更新', function () {
    it('需要登录', () => api.update(1, ts, '').expect(UserResTypes.unauthorized));
    it('需要权限', async () => {
      const { commonUser } = await createUsers();
      return api.update(1, ts, commonUser.token).expect(UserResTypes['403']);
    });
    it('分类不存在', async () => {
      const admin = await createAdmin();
      await api.update(1, ts, admin.token).expect(CateResTypes.notFound);
    });
    it('更新成功', async () => {
      const admin = await createAdmin();
      await api.create(ts, admin.token).expect(CateResTypes.created);
      await api
        .update(1, { ...ts, name: 'TS' }, admin.token)
        .expect(
          /\{"code":200,"msg":"Success","data":\{"id":1,"name":"TS","description":"Javascript超集","updateAt":"[^"]{24}","deletedAt":null}}/,
        );
      await api
        .get(1)
        // '{"code":200,"msg":"Success","data":{"id":1,"name":"TS","description":"Javascript超集","createBy":{"id":1,"nickname":"hello_9","avatar":"https://my-blog-store.oss-cn-guangzhou.aliyuncs.com/store/20201103002944_c9ed4.jpeg"},"articleCount":0}}'
        ///\{"code":200,"msg":"Success","data":\{"id":1,"name":"Typescript","description":"Javascript超集","createBy":\{"id":1,"nickname":"hello_\d+","avatar":"https:\/\/my-blog-store.oss-cn-guangzhou.aliyuncs.com\/store\/20201103002944_c9ed4.jpeg"},"articleCount":0}}/
        .expect(
          new RegExp(
            `\\{"code":200,"msg":"Success","data":\\{"id":1,"name":"TS","description":"Javascript超集","createBy":\\{"id":1,"nickname":"hello_\\d+","avatar":"${UserEntity.DEFAULT_AVATAR}"},"articleCount":0}}`,
          ),
        );
    });
  });
  describe('删除', function () {
    it('需要登录', () => api.delete(1, '').expect(UserResTypes.unauthorized));
    it('需要权限', async () => {
      const { commonUser } = await createUsers();
      return api.delete(1, commonUser.token).expect(UserResTypes['403']);
    });
    it('分类不存在', async () => {
      const admin = await createAdmin();
      await api.delete(1, admin.token).expect(CateResTypes.notFound);
    });
    it('删除成功', async () => {
      const admin = await createAdmin();
      await api.create(ts, admin.token).expect(CateResTypes.created);
      await api.delete(1, admin.token).expect(UserResTypes.success);
      await api.get(1).expect(CateResTypes.notFound);
    });
    it('不可删除有文章的分类', async () => {
      const admin = await createAdmin();
      const {
        body: {
          data: { id },
        },
      } = await api.create(ts, admin.token).expect(CateResTypes.created);
      expect(id).toBe(1);

      const article = new ArticleEntity();
      article.categoryId = id;
      article.title = 'test';
      article.description = 'test';
      article.content = 'test';
      article.authorId = admin.id;
      await article.save();

      await api
        .delete(1, admin.token)
        .expect(
          '{"code":403,"msg":"该分类有被文章使用，可先把这些文章改为其他分类再执行删除操作"}',
        );
    });
  });
});
