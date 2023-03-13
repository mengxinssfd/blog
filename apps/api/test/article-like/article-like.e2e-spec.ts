import { buildApp } from '../utils';
import * as ArticleApi from '../article/api';
import * as LikeApi from './api';
import { userApi } from '../user/api';
import { ResTypes as UserResTypes } from '../user/utils';
import { ArticleEntity, UserEntity } from '@blog/entities';

describe('/article-like 文章👍', () => {
  const request = buildApp();
  const api = LikeApi.useApi(request);
  const articleApi = ArticleApi.useApi(request);
  const { createAllRoleUsers } = userApi(request);

  let RoleUsers: Awaited<ReturnType<typeof createAllRoleUsers>>;

  let ArticleIds: Awaited<ReturnType<typeof articleApi.createArticles>>;

  describe('init', function () {
    it('创建各角色', async () => {
      RoleUsers = await createAllRoleUsers();
    });
    it('创建各种文章', async () => {
      ArticleIds = await articleApi.createArticles(RoleUsers.dev.token);
    });
  });

  describe('公开的文章', function () {
    it('文章点赞数量：0', () => {
      return api
        .countByArticleId(ArticleIds.publicArticleId)
        .expect(200)
        .expect('{"code":200,"msg":"Success","data":{"count":0,"checked":0}}');
    });
    it('有账号点赞', () => {
      return api
        .setLike(ArticleIds.publicArticleId, RoleUsers.common.token)
        .expect(LikeApi.ResType.created);
    });
    it('无账号点赞', () => {
      return api.setLike(ArticleIds.publicArticleId).expect(LikeApi.ResType.created);
    });
    describe('文章点赞数量：2', function () {
      it('自己点了(ip)', () => {
        return api
          .countByArticleId(ArticleIds.publicArticleId)
          .expect(200)
          .expect('{"code":200,"msg":"Success","data":{"count":2,"checked":1}}');
      });
      it('自己没点(换ip)', () => {
        return api
          .countByArticleId(ArticleIds.publicArticleId)
          .set('X-Forwarded-For', '1.0.1.255')
          .expect(200)
          .expect('{"code":200,"msg":"Success","data":{"count":2,"checked":0}}');
      });
      it('自己点了(token)', () => {
        return api
          .countByArticleId(ArticleIds.publicArticleId, RoleUsers.common.token)
          .expect(200)
          .expect('{"code":200,"msg":"Success","data":{"count":2,"checked":1}}');
      });
      it('自己没点(换token)', () => {
        return api
          .countByArticleId(ArticleIds.publicArticleId, RoleUsers.dev.token)
          .expect(200)
          .expect('{"code":200,"msg":"Success","data":{"count":2,"checked":0}}');
      });
    });
    it('有账号点赞(取消点赞)', () => {
      return api
        .setLike(ArticleIds.publicArticleId, RoleUsers.common.token)
        .expect('{"code":200,"msg":"Success","data":{"count":1,"checked":0}}');
    });
    it('文章点赞数量：1，自己没点(token, 已取消)', () => {
      return api
        .countByArticleId(ArticleIds.publicArticleId, RoleUsers.common.token)
        .expect(200)
        .expect('{"code":200,"msg":"Success","data":{"count":1,"checked":0}}');
    });
    it('再次点赞', () => {
      console.log('再次点赞');
      return api
        .setLike(ArticleIds.publicArticleId, RoleUsers.common.token)
        .expect(200)
        .expect('{"code":200,"msg":"Success","data":{"count":2,"checked":1}}');
    });
  });
  describe('私有的文章', function () {
    it('文章点赞数量：0', () => {
      return api
        .countByArticleId(ArticleIds.privateArticleId)
        .expect(200)
        .expect('{"code":200,"msg":"Success","data":{"count":0,"checked":0}}');
    });
    it('有账号点赞', () => {
      return api
        .setLike(ArticleIds.privateArticleId, RoleUsers.common.token)
        .expect('{"code":403,"msg":"不可添加或修改私有文章的点赞"}');
    });
    it('无账号点赞', () => {
      return api
        .setLike(ArticleIds.privateArticleId)
        .expect('{"code":403,"msg":"不可添加或修改私有文章的点赞"}');
    });
    it('文章点赞数量：0', () => {
      return api
        .countByArticleId(ArticleIds.privateArticleId)
        .set('X-Forwarded-For', '1.0.1.255')
        .expect(200)
        .expect('{"code":200,"msg":"Success","data":{"count":0,"checked":0}}');
    });
  });
  describe('获取自己的所有点赞及其文章', function () {
    it('需要登录', () => {
      return api.getMyAll('').expect(200).expect(UserResTypes.unauthorized);
    });
    it('获取成功', async () => {
      await api
        .getMyAll(RoleUsers.common.token)
        .expect(200)
        .expect(
          new RegExp(
            `\\{"code":200,"msg":"Success","data":\\{"list":\\[\\{"id":\\d+,"version":\\d+,"touristIp":null,"user":\\{"id":\\d+,"nickname":"hello_\\d+","avatar":"${UserEntity.DEFAULT_AVATAR}"},"article":\\{"id":1,"status":1,"version":1,"title":"测试一些","description":"测试一下","viewCount":0,"cover":"${ArticleEntity.DEFAULT_COVER}","bgm":"","commentLock":false}}],"count":1}}`,
          ),
        );
      await api
        .getMyAll(RoleUsers.common.token, { pageSize: 10, page: '2' } as any)
        .expect(200)
        .expect('{"code":200,"msg":"Success","data":{"list":[],"count":1}}');
    });
  });
  describe('获取所有点赞', function () {
    it('需要登录', () => {
      return api.getAll('').expect(200).expect(UserResTypes.unauthorized);
    });
    it('需要权限', async () => {
      await api.getAll(RoleUsers.common.token).expect(200).expect(UserResTypes['403']);
      await api.getAll(RoleUsers.dev.token).expect(200).expect(UserResTypes['403']);
      await api.getAll(RoleUsers.admin.token).expect(200).expect(UserResTypes['403']);
    });
    it('获取成功', async () => {
      await api
        .getAll(RoleUsers.superAdmin.token)
        .expect(200)
        .expect(
          new RegExp(
            `\\{"code":200,"msg":"Success","data":\\{"list":\\[\\{"id":1,"version":3,"touristIp":null,"user":\\{"id":2,"nickname":"hello_1","avatar":"${UserEntity.DEFAULT_AVATAR}"},"article":\\{"id":1,"title":"测试一些","description":"测试一下","category":\\{"id":1,"name":"Front Dev","description":"前端开发"},"tags":\\[\\{"id":1,"name":"Typescript","description":"Javascript超类"}],"author":\\{"id":3,"nickname":"hello_2","avatar":"${UserEntity.DEFAULT_AVATAR}"}}},\\{"id":2,"version":1,"touristIp":"127.0.0.1","user":null,"article":\\{"id":1,"title":"测试一些","description":"测试一下","category":\\{"id":1,"name":"Front Dev","description":"前端开发"},"tags":\\[\\{"id":1,"name":"Typescript","description":"Javascript超类"}],"author":{"id":3,"nickname":"hello_2","avatar":"${UserEntity.DEFAULT_AVATAR}"}}}],"count":2}}`,
          ),
        );
      await api
        .getAll(RoleUsers.superAdmin.token, { pageSize: 10, page: '2' } as any)
        .expect(200)
        .expect(`{"code":200,"msg":"Success","data":{"list":[],"count":2}}`);
    });
  });
  describe('删除', function () {
    it('需要登录', () => {
      return api.delete(1, '').expect(200).expect(UserResTypes.unauthorized);
    });
    it('需要权限', async () => {
      await api.delete(1, RoleUsers.common.token).expect(200).expect(UserResTypes['403']);
      await api.delete(1, RoleUsers.dev.token).expect(200).expect(UserResTypes['403']);
      await api.delete(1, RoleUsers.admin.token).expect(200).expect(UserResTypes['403']);
    });
    it('删除成功', async () => {
      await api
        .delete(1, RoleUsers.superAdmin.token)
        .expect(200)
        .expect('{"code":200,"msg":"Success","data":{"affected":1}}');
      await api
        .getAll(RoleUsers.superAdmin.token, { pageSize: 10, page: '2' } as any)
        .expect(200)
        .expect(`{"code":200,"msg":"Success","data":{"list":[],"count":1}}`);
    });
  });
});
