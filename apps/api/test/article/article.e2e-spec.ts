import { buildApp, clearAllTables } from '../utils';
import * as ArticleApi from './api';
import { ResTypes as UserResTypes } from '../user/utils';
import { userApi } from '../user/api';
import { ArticleEntity, UserEntity } from '@blog/entities';
import { CreateArticleDto } from '@blog/dtos';
import * as CateApi from '../category/api';
import * as TagApi from '../tag/api';

describe('/article 文章', () => {
  const request = buildApp();
  const api = ArticleApi.useApi(request);
  const { createAllRoleUsers } = userApi(request);
  const cateApi = CateApi.cateApi(request);
  const tagApi = TagApi.tagApi(request);

  const articleInfo: CreateArticleDto = {
    title: '测试一些',
    description: '测试一下',
    content: '#测试一下',
    categoryId: 0,
    tags: [],
    isPublic: false,
  };
  let privateArticleId = 0;
  let publicArticleId = 0;

  let RoleUsers: Awaited<ReturnType<typeof createAllRoleUsers>>;
  const frontCate = { name: 'Front Dev', description: '前端开发' };
  const tsTag = { name: 'Typescript', description: 'Javascript超类' };
  // const jsTag = { name: 'Javascript', description: 'Javascript脚本' };

  describe('创建各角色账号', function () {
    it('成功', async () => {
      RoleUsers = await createAllRoleUsers();
    });
  });
  describe('创建', function () {
    it('封面不是一个链接', async () => {
      await api
        .create({ ...articleInfo, cover: '2111' }, RoleUsers.superAdmin.token)
        .expect('{"code":400,"msg":"封面不是一个链接"}');
    });
    it('分类不存在', async () => {
      await api
        .create(articleInfo, RoleUsers.superAdmin.token)
        .expect(CateApi.CateResTypes.notFound);
    });
    it('标签不存在', async () => {
      articleInfo.categoryId = await cateApi
        .create(frontCate, RoleUsers.superAdmin.token)
        .then<number>((res) => res.body.data.id);
      await api
        .create(articleInfo, RoleUsers.superAdmin.token)
        .expect('{"code":403,"msg":"文章必须要有一个标签"}');
    });
    it('需要登录', () => {
      return api.create(articleInfo, '').expect(UserResTypes.unauthorized);
    });
    it('普通用户无权限创建', async () => {
      await api.create(articleInfo, RoleUsers.common.token).expect(UserResTypes['403']);
    });
    it('dev用户有权创建，创建非public文章', async () => {
      articleInfo.tags.push(
        await tagApi
          .create(tsTag, RoleUsers.dev.token)
          .expect(TagApi.TagResTypes.created)
          .then<number>((res) => res.body.data.id),
      );
      articleInfo.isPublic = false;
      privateArticleId = await api
        .create(articleInfo, RoleUsers.dev.token)
        .expect(ArticleApi.ResType.created)
        .then((res) => res.body.data.articleId);
    });
    it('dev用户有权创建，可重复创建，创建public文章', async () => {
      articleInfo.isPublic = true;
      publicArticleId = await api
        .create(articleInfo, RoleUsers.dev2.token)
        .expect(ArticleApi.ResType.created)
        .then((res) => res.body.data.articleId);
    });
    it('admin用户有权创建', async () => {
      return api.create(articleInfo, RoleUsers.admin.token).expect(ArticleApi.ResType.created);
    });
    it('superAdmin用户有权创建', async () => {
      return api.create(articleInfo, RoleUsers.admin.token).expect(ArticleApi.ResType.created);
    });
  });
  describe('根据id获取', function () {
    it('文章不存在', async () => {
      return api.get(999).expect(ArticleApi.ResType.notFound);
    });
    it('成功获取public文章', async () => {
      expect(publicArticleId).toBe(2);
      const resType = new RegExp(
        `\\{"code":200,"msg":"Success","data":\\{"id":2,"createAt":"[^"]{24}","updateAt":"[^"]{24}","deletedAt":null,"status":1,"version":1,"title":"测试一些","description":"测试一下","content":"<p>#测试一下</p>\\\\n","authorId":4,"viewCount":1,"cover":"${ArticleEntity.DEFAULT_COVER}","bgm":"","commentLock":false,"author":\\{"id":4,"nickname":"hello_\\d+","avatar":"${UserEntity.DEFAULT_AVATAR}"},"tags":\\[\\{"id":1,"name":"Typescript","description":"Javascript超类"}],"category":\\{"id":1,"name":"Front Dev","description":"前端开发"}}}`,
      );
      return api.get(publicArticleId).expect(resType);
    });
    it('非登录状态private文章不存在', async () => {
      expect(privateArticleId).toBe(1);
      return api.get(privateArticleId).expect(ArticleApi.ResType.notFound);
    });
    it('普通用户登录状态获取private文章，文章不存在', async () => {
      return api.get(privateArticleId, RoleUsers.common.token).expect(ArticleApi.ResType.notFound);
    });

    it('admin可查看private文章', async () => {
      const resType = new RegExp(
        `\\{"code":200,"msg":"Success","data":\\{"id":1,"createAt":"[^"]{24}","updateAt":"[^"]{24}","deletedAt":null,"status":0,"version":1,"title":"测试一些","description":"测试一下","content":"<p>#测试一下</p>\\\\n","authorId":3,"viewCount":0,"cover":"${ArticleEntity.DEFAULT_COVER}","bgm":"","commentLock":false,"author":\\{"id":3,"nickname":"hello_\\d+","avatar":"${UserEntity.DEFAULT_AVATAR}"},"tags":\\[\\{"id":1,"name":"Typescript","description":"Javascript超类"}],"category":\\{"id":1,"name":"Front Dev","description":"前端开发"}}}`,
      );
      console.log('id', RoleUsers.admin.id);
      await api.get(privateArticleId, RoleUsers.admin.token).expect(resType);
    });
    it('superAdmin可查看private文章', () => {
      const resType = new RegExp(
        `\\{"code":200,"msg":"Success","data":\\{"id":1,"createAt":"[^"]{24}","updateAt":"[^"]{24}","deletedAt":null,"status":0,"version":1,"title":"测试一些","description":"测试一下","content":"<p>#测试一下</p>\\\\n","authorId":3,"viewCount":0,"cover":"${ArticleEntity.DEFAULT_COVER}","bgm":"","commentLock":false,"author":\\{"id":3,"nickname":"hello_\\d+","avatar":"${UserEntity.DEFAULT_AVATAR}"},"tags":\\[\\{"id":1,"name":"Typescript","description":"Javascript超类"}],"category":\\{"id":1,"name":"Front Dev","description":"前端开发"}}}`,
      );
      return api.get(privateArticleId, RoleUsers.superAdmin.token).expect(resType);
    });
  });

  describe('更新', function () {
    it('需要登录', () => api.update(1, articleInfo, '').expect(UserResTypes.unauthorized));
    it('需要权限', async () => {
      return api.update(1, articleInfo, RoleUsers.common.token).expect(UserResTypes['403']);
    });
    it('不能编辑其他账号创建的文章', async () => {
      return api
        .update(privateArticleId, articleInfo, RoleUsers.dev2.token)
        .expect('{"code":403,"msg":"只能修改自己创建的文章"}');
    });
    it('更新成功', async () => {
      await api
        .update(
          privateArticleId,
          { title: 'TS', categoryId: articleInfo.categoryId, tags: articleInfo.tags },
          RoleUsers.dev.token,
        )
        .expect(
          new RegExp(
            `\\{"code":200,"msg":"Success","data":\\{"title":"TS","categoryId":1,"tags":\\[\\{"id":1}],"id":1,"updateAt":"[^"]{24}","deletedAt":null,"version":2}}`,
          ),
        );
      await api.get(privateArticleId).expect(ArticleApi.ResType.notFound);
      await api
        .get(privateArticleId, RoleUsers.dev.token)
        .expect(
          new RegExp(
            `\\{"code":200,"msg":"Success","data":\\{"id":1,"createAt":"[^"]{24}","updateAt":"[^"]{24}","deletedAt":null,"status":0,"version":2,"title":"TS","description":"测试一下","content":"<p>#测试一下</p>\\\\n","authorId":3,"viewCount":0,"cover":"${ArticleEntity.DEFAULT_COVER}","bgm":"","commentLock":false,"author":\\{"id":3,"nickname":"hello_\\d+","avatar":"${UserEntity.DEFAULT_AVATAR}"},"tags":\\[\\{"id":1,"name":"Typescript","description":"Javascript超类"}],"category":\\{"id":1,"name":"Front Dev","description":"前端开发"}}}`,
          ),
        );
    });
  });
  describe('删除', function () {
    it('需要登录', () => api.delete(privateArticleId, '').expect(UserResTypes.unauthorized));
    it('需要权限', async () => {
      return api.delete(privateArticleId, RoleUsers.common.token).expect(UserResTypes['403']);
    });
    it('删除成功', async () => {
      await api.create(articleInfo, RoleUsers.admin.token).expect(ArticleApi.ResType.created);
      await api.delete(privateArticleId, RoleUsers.admin.token).expect(UserResTypes.success);
      await api.get(privateArticleId).expect(ArticleApi.ResType.notFound);
    });
  });

  describe('列表', function () {
    // it('获取成功', () => {
    //   return api
    //     .list()
    //     .expect(
    //       `{"code":200,"msg":"Success","data":[{"id":1,${tsStr.slice(1, -1)},"articleCount":0}]}`,
    //     );
    // });
    it('空列表', async () => {
      await clearAllTables();
      await api.list().expect(ArticleApi.ResType.emptyList);
    });
  });
});
