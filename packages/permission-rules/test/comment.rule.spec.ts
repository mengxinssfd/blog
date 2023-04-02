import { ArticleEntity, CommentEntity } from '@blog/entities';
import { getRoles } from './utils';
import { Action, CaslAbilityFactory } from '../src';

describe('comment', function () {
  const { superAdmin, admin, dev, commonUser1 } = getRoles();
  const factory = new CaslAbilityFactory();

  const commonAb = factory.createForUser(commonUser1);
  const devAb = factory.createForUser(dev);
  const adminAb = factory.createForUser(admin);
  const superAb = factory.createForUser(superAdmin);

  describe('添加', function () {
    it('commonUser', () => {
      expect(commonAb.can(Action.Create, CommentEntity)).toBeTruthy();
      expect(commonAb.cannot(Action.Create, new CommentEntity())).toBeTruthy();
      expect(commonAb.can(Action.Create, CommentEntity.modelName)).toBeTruthy();
    });
    it('dev', () => {
      expect(devAb.can(Action.Create, CommentEntity)).toBeTruthy();
      expect(devAb.cannot(Action.Create, new CommentEntity())).toBeTruthy();
      expect(devAb.can(Action.Create, CommentEntity.modelName)).toBeTruthy();
    });
    it('admin', () => {
      expect(adminAb.can(Action.Create, CommentEntity)).toBeTruthy();
      expect(adminAb.can(Action.Create, new CommentEntity())).toBeTruthy();
      expect(adminAb.can(Action.Create, CommentEntity.modelName)).toBeTruthy();
    });
    it('superAdmin', () => {
      expect(superAb.can(Action.Create, CommentEntity)).toBeTruthy();
      expect(superAb.can(Action.Create, new CommentEntity())).toBeTruthy();
      expect(superAb.can(Action.Create, CommentEntity.modelName)).toBeTruthy();
    });
  });
  describe('删除', function () {
    it('commonUser', () => {
      expect(commonAb.cannot(Action.Delete, CommentEntity)).toBeTruthy();
      expect(commonAb.cannot(Action.Delete, new CommentEntity())).toBeTruthy();
      expect(commonAb.cannot(Action.Delete, CommentEntity.modelName)).toBeTruthy();
    });
    it('dev', () => {
      expect(devAb.cannot(Action.Delete, CommentEntity)).toBeTruthy();
      expect(devAb.cannot(Action.Delete, new CommentEntity())).toBeTruthy();
      expect(devAb.cannot(Action.Delete, CommentEntity.modelName)).toBeTruthy();
    });
    it('admin', () => {
      expect(adminAb.cannot(Action.Delete, CommentEntity)).toBeTruthy();
      expect(adminAb.cannot(Action.Delete, new CommentEntity())).toBeTruthy();
      expect(adminAb.cannot(Action.Delete, CommentEntity.modelName)).toBeTruthy();
    });
    it('superAdmin', () => {
      expect(superAb.can(Action.Delete, CommentEntity)).toBeTruthy();
      expect(superAb.can(Action.Delete, new CommentEntity())).toBeTruthy();
      expect(superAb.can(Action.Delete, CommentEntity.modelName)).toBeTruthy();
    });
  });
  describe('更新', function () {
    it('commonUser', () => {
      expect(commonAb.cannot(Action.Update, CommentEntity)).toBeTruthy();
      expect(commonAb.cannot(Action.Update, new CommentEntity())).toBeTruthy();
      expect(commonAb.cannot(Action.Update, CommentEntity.modelName)).toBeTruthy();
    });
    it('dev', () => {
      expect(devAb.cannot(Action.Update, CommentEntity)).toBeTruthy();
      expect(devAb.cannot(Action.Update, new CommentEntity())).toBeTruthy();
      expect(devAb.cannot(Action.Update, CommentEntity.modelName)).toBeTruthy();
    });
    it('admin', () => {
      expect(adminAb.cannot(Action.Update, CommentEntity)).toBeTruthy();
      expect(adminAb.cannot(Action.Update, new CommentEntity())).toBeTruthy();
      expect(adminAb.cannot(Action.Update, CommentEntity.modelName)).toBeTruthy();
    });
    it('superAdmin', () => {
      expect(superAb.can(Action.Update, CommentEntity)).toBeTruthy();
      expect(superAb.can(Action.Update, new CommentEntity())).toBeTruthy();
      expect(superAb.can(Action.Update, CommentEntity.modelName)).toBeTruthy();
    });
  });

  const article = new ArticleEntity();
  article.status = ArticleEntity.STATE.public;
  article.deletedAt = null;

  const comment = new CommentEntity();
  comment.id = 1;
  comment.article = article;

  it('可评论公开文章', () => {
    article.status = ArticleEntity.STATE.public;
    expect(commonAb.can(Action.Create, comment)).toBeTruthy();
  });
  it('不可评论非公开文章', async () => {
    expect.assertions(3);
    article.status = ArticleEntity.STATE.private;
    expect(commonAb.cannot(Action.Create, comment)).toBeTruthy();
    expect(commonAb.cannot(Action.Update, comment)).toBeTruthy();

    try {
      await factory
        .find(async () => comment)
        .unless(commonUser1)
        .can(Action.Create);
    } catch (e: any) {
      expect(e.message).toBe('文章不存在');
    }

    article.status = ArticleEntity.STATE.public;
  });
  it('不可更改他人评论', () => {
    comment.userId = admin.id;
    expect(commonAb.cannot(Action.Update, comment)).toBeTruthy();
  });
  it('不可评论已删除文章', async () => {
    expect.assertions(5);
    article.deletedAt = new Date();
    expect(superAb.can(Action.Create, comment)).toBeTruthy();
    expect(superAb.can(Action.Update, comment)).toBeTruthy();

    try {
      await factory
        .find(async () => comment)
        .unless(commonUser1)
        .can(Action.Create);
    } catch (e: any) {
      expect(e.message).toBe('不可添加或修改已删除文章的评论');
    }
    try {
      await factory
        .find(async () => comment)
        .unless(dev)
        .can(Action.Create);
    } catch (e: any) {
      expect(e.message).toBe('不可添加或修改已删除文章的评论');
    }
    try {
      await factory
        .find(async () => comment)
        .unless(commonUser1)
        .can(Action.Update);
    } catch (e: any) {
      expect(e.message).toBe('不可添加或修改已删除文章的评论');
    }
    article.deletedAt = null;
  });
  describe('回复', () => {
    const rootComment = Object.assign(new CommentEntity(), comment);
    const reply = Object.assign(new CommentEntity(), comment);
    reply.id = 2;
    reply.replyId = rootComment.id;
    reply.reply = rootComment;

    it('回复成功', () => {
      expect(commonAb.can(Action.Create, reply)).toBeTruthy();
    });

    it('回复的评论不存在', async () => {
      expect.assertions(2);

      rootComment.deletedAt = new Date();
      expect(commonAb.cannot(Action.Create, reply)).toBeTruthy();
      console.log(reply);
      try {
        await factory
          .find(async () => reply)
          .unless(commonUser1)
          .can(Action.Create);
      } catch (e: any) {
        expect(e.message).toBe('回复的评论不存在');
      }
    });
  });
});
