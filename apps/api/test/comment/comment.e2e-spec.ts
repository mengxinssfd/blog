import { buildApp } from '../utils';
import * as ArticleApi from '../article/api';
import * as CommentApi from './api';
import { userApi } from '../user/api';
import { ArticleEntity, UserEntity } from '@blog/entities';
import { ResTypes as UserResTypes } from '../user/utils';
// import { ArticleEntity, UserEntity } from '@blog/entities';
const dateReg = '[^"]{24}';
describe('/comment 评论', () => {
  const request = buildApp();
  const api = CommentApi.useApi(request);
  const articleApi = ArticleApi.useApi(request);
  const { createAllRoleUsers, mute } = userApi(request);

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
    it('文章评论数量：0', () => {
      return api
        .getByArticleId(ArticleIds.publicArticleId)
        .expect(200)
        .expect('{"code":200,"msg":"Success","data":{"list":[],"count":0}}');
    });

    it('有账号评论', () => {
      return api
        .create(
          { articleId: ArticleIds.publicArticleId, userId: RoleUsers.dev.id, content: '你好呀' },
          RoleUsers.common.token,
        )
        .expect(CommentApi.ResType.createdByUser);
    });

    it('无账号评论，提交数据校验失败', () => {
      return api
        .create({ content: 'test', articleId: ArticleIds.publicArticleId })
        .expect(200)
        .expect(
          '{"code":400,"msg":"content(test)包含禁用词!请修改后再提交;游客名长度不能超过24;游客名不能为空"}',
        );
    });
    it('无账号评论', () => {
      return api
        .create({
          content: 'hello world',
          articleId: ArticleIds.publicArticleId,
          touristName: 'tourist',
        })
        .expect(CommentApi.ResType.createdByTourist);
    });
    it('文章评论列表', () => {
      return api
        .getByArticleId(ArticleIds.publicArticleId)
        .expect(200)
        .expect(
          new RegExp(
            `\\{"code":200,"msg":"Success","data":\\{"list":\\[\\{"id":\\d+,"createAt":"${dateReg}","content":"hello world","articleId":${ArticleIds.publicArticleId},"isTop":null,"parentId":null,"replyId":null,"replyUserId":null,"userId":null,"touristName":"tourist","user":null,"replyUser":null,"like":\\{"checked":0,"count":0},"dislike":\\{"checked":0,"count":0}},\\{"id":1,"createAt":"${dateReg}","content":"你好呀","articleId":1,"isTop":null,"parentId":null,"replyId":null,"replyUserId":null,"userId":${RoleUsers.common.id},"touristName":null,"user":\\{"id":${RoleUsers.common.id},"nickname":"${RoleUsers.common.nickname}","avatar":"${UserEntity.DEFAULT_AVATAR}"},"replyUser":null,"like":\\{"checked":0,"count":0},"dislike":\\{"checked":0,"count":0}}],"count":2}}`,
          ),
        );
    });
  });
  describe('禁止评论', function () {
    it('私有的文章', () => {
      return api
        .create(
          { articleId: ArticleIds.privateArticleId, userId: 1, content: '你好呀' },
          RoleUsers.common.token,
        )
        .expect(200)
        .expect(CommentApi.ResType.notFound);
    });
    it('锁评论', async () => {
      const article = new ArticleEntity();
      article.id = ArticleIds.publicArticleId;
      article.commentLock = true;
      await ArticleEntity.save(article);

      await api
        .create(
          { articleId: ArticleIds.publicArticleId, userId: 1, content: '你好呀' },
          RoleUsers.common.token,
        )
        .expect(200)
        .expect('{"code":403,"msg":"该文章禁止评论"}');

      article.commentLock = false;
      await ArticleEntity.save(article);
    });
    it('账号被禁言', async () => {
      await mute(RoleUsers.common.id, RoleUsers.superAdmin.token, true).expect(
        UserResTypes.success,
      );
      await api
        .create(
          { articleId: ArticleIds.publicArticleId, userId: 1, content: '被禁言' },
          RoleUsers.common.token,
        )
        .expect(200)
        .expect('{"code":403,"msg":"你已被禁言，可联系管理员解除禁言"}');
    });
    it('频率限制', async () => {
      await api
        .create(
          { articleId: ArticleIds.privateArticleId, userId: 1, content: '你好呀' },
          RoleUsers.common.token,
        )
        .expect(200)
        .expect('{"code":403,"msg":"文章不存在"}');
      await api
        .create(
          { articleId: ArticleIds.privateArticleId, userId: 1, content: '你好呀' },
          RoleUsers.common.token,
        )
        .expect(200)
        .expect('{"code":429,"msg":"请求过于频繁"}');
    });
    it('再次成功', () => {
      return api
        .create(
          { articleId: ArticleIds.publicArticleId, userId: 1, content: '你好呀' },
          RoleUsers.dev.token,
        )
        .set('X-Forwarded-For', '127.0.0.2')
        .expect(201)
        .expect(CommentApi.ResType.createdByUser);
    });
  });
  describe('回复', function () {
    it('有账号回复', () => {
      return api
        .create(
          {
            articleId: ArticleIds.publicArticleId,
            userId: 1,
            parentId: 1,
            replyId: 1,
            content: '你好呀',
          },
          RoleUsers.dev.token,
        )
        .expect(
          /\{"code":201,"msg":"Success","data":\{"article":\{"id":\d+},"articleId":\d,"user":{"id":\d},"userId":\d,"content":"[^"]+","parentId":\d+,"replyId":\d+,"deletedAt":null,"isTop":null,"replyUserId":null,"touristIp":null,"touristName":null,"id":\d,"createAt":"[^"]{24}","updateAt":"[^"]{24}"}}/,
        );
    });
    it('获取回复', () => {
      const articleReg = '\\{"id":1,"title":"测试一些","authorId":3}';
      return api
        .getReplyMeAll(RoleUsers.dev.token)
        .expect(
          new RegExp(
            `\\{"code":200,"msg":"Success","data":\\{"count":4,"list":\\[\\{"user":\\{"id":2,"nickname":"hello_1","avatar":"${UserEntity.DEFAULT_AVATAR}"},"createAt":"${dateReg}","deletedAt":null,"content":"你好呀","replyUserId":null,"touristName":null,"article":${articleReg},"id":1,"userId":2},\\{"user":\\{"id":null,"nickname":null,"avatar":null},"createAt":"${dateReg}","deletedAt":null,"content":"hello world","replyUserId":null,"touristName":"tourist","article":${articleReg},"id":2,"userId":null},\\{"user":\\{"id":3,"nickname":"hello_2","avatar":"${UserEntity.DEFAULT_AVATAR}"},"createAt":"${dateReg}","deletedAt":null,"content":"你好呀","replyUserId":null,"touristName":null,"article":${articleReg},"id":3,"userId":3},\\{"user":\\{"id":3,"nickname":"hello_2","avatar":"${UserEntity.DEFAULT_AVATAR}"},"createAt":"${dateReg}","deletedAt":null,"content":"你好呀","replyUserId":null,"touristName":null,"article":${articleReg},"id":4,"userId":3}]}}`,
          ),
        );
    });
  });

  /*
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
   */
  describe('删除', function () {
    it('需要登录', () => {
      return api.delete(1, '').expect(200).expect(UserResTypes.unauthorized);
    });
    it('不可删除其他账号的评论', async () => {
      await api
        .delete(1, RoleUsers.dev.token)
        .expect(200)
        .expect('{"code":403,"msg":"不可删除其他账号的评论"}');
    });
    it('删除成功', async () => {
      await api
        .delete(1, RoleUsers.common.token)
        .expect(200)
        .expect('{"code":200,"msg":"Success","data":{"affected":1}}');
      await api
        .delete(2, RoleUsers.superAdmin.token)
        .expect(200)
        .expect('{"code":200,"msg":"Success","data":{"affected":1}}');
      // await api
      //   .getAll(RoleUsers.superAdmin.token, { pageSize: 10, page: '2' } as any)
      //   .expect(200)
      //   .expect(`{"code":200,"msg":"Success","data":{"list":[],"count":1}}`);
    });
  });
});
