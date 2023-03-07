import { ArticleEntity, ArticleLikeEntity } from '@blog/entities';
import { getRoles } from './utils';
import { Action, CaslAbilityFactory } from '../src';

describe('article-like', function () {
  const { superAdmin, admin, dev, commonUser1 } = getRoles();
  const factory = new CaslAbilityFactory();

  const commonAb = factory.createForUser(commonUser1);
  const devAb = factory.createForUser(dev);
  const adminAb = factory.createForUser(admin);
  const superAb = factory.createForUser(superAdmin);

  describe('添加', function () {
    it('commonUser', () => {
      expect(commonAb.can(Action.Create, ArticleLikeEntity)).toBeTruthy();
      expect(commonAb.cannot(Action.Create, new ArticleLikeEntity())).toBeTruthy();
      expect(commonAb.can(Action.Create, ArticleLikeEntity.modelName)).toBeTruthy();
    });
    it('dev', () => {
      expect(devAb.can(Action.Create, ArticleLikeEntity)).toBeTruthy();
      expect(devAb.cannot(Action.Create, new ArticleLikeEntity())).toBeTruthy();
      expect(devAb.can(Action.Create, ArticleLikeEntity.modelName)).toBeTruthy();
    });
    it('admin', () => {
      expect(adminAb.can(Action.Create, ArticleLikeEntity)).toBeTruthy();
      expect(adminAb.cannot(Action.Create, new ArticleLikeEntity())).toBeTruthy();
      expect(adminAb.can(Action.Create, ArticleLikeEntity.modelName)).toBeTruthy();
    });
    it('superAdmin', () => {
      expect(superAb.can(Action.Create, ArticleLikeEntity)).toBeTruthy();
      expect(superAb.cannot(Action.Create, new ArticleLikeEntity())).toBeTruthy();
      expect(superAb.can(Action.Create, ArticleLikeEntity.modelName)).toBeTruthy();
    });
  });
  describe('删除', function () {
    it('commonUser', () => {
      expect(commonAb.cannot(Action.Delete, ArticleLikeEntity)).toBeTruthy();
      expect(commonAb.cannot(Action.Delete, new ArticleLikeEntity())).toBeTruthy();
      expect(commonAb.cannot(Action.Delete, ArticleLikeEntity.modelName)).toBeTruthy();
    });
    it('dev', () => {
      expect(devAb.cannot(Action.Delete, ArticleLikeEntity)).toBeTruthy();
      expect(devAb.cannot(Action.Delete, new ArticleLikeEntity())).toBeTruthy();
      expect(devAb.cannot(Action.Delete, ArticleLikeEntity.modelName)).toBeTruthy();
    });
    it('admin', () => {
      expect(adminAb.cannot(Action.Delete, ArticleLikeEntity)).toBeTruthy();
      expect(adminAb.cannot(Action.Delete, new ArticleLikeEntity())).toBeTruthy();
      expect(adminAb.cannot(Action.Delete, ArticleLikeEntity.modelName)).toBeTruthy();
    });
    it('superAdmin', () => {
      expect(superAb.can(Action.Delete, ArticleLikeEntity)).toBeTruthy();
      expect(superAb.can(Action.Delete, new ArticleLikeEntity())).toBeTruthy();
      expect(superAb.can(Action.Delete, ArticleLikeEntity.modelName)).toBeTruthy();
    });
  });
  describe('更新', function () {
    it('commonUser', () => {
      expect(commonAb.can(Action.Update, ArticleLikeEntity)).toBeTruthy();
      expect(commonAb.cannot(Action.Update, new ArticleLikeEntity())).toBeTruthy();
      expect(commonAb.can(Action.Update, ArticleLikeEntity.modelName)).toBeTruthy();
    });
    it('dev', () => {
      expect(devAb.can(Action.Update, ArticleLikeEntity)).toBeTruthy();
      expect(devAb.cannot(Action.Update, new ArticleLikeEntity())).toBeTruthy();
      expect(devAb.can(Action.Update, ArticleLikeEntity.modelName)).toBeTruthy();
    });
    it('admin', () => {
      expect(adminAb.can(Action.Update, ArticleLikeEntity)).toBeTruthy();
      expect(adminAb.cannot(Action.Update, new ArticleLikeEntity())).toBeTruthy();
      expect(adminAb.can(Action.Update, ArticleLikeEntity.modelName)).toBeTruthy();
    });
    it('superAdmin', () => {
      expect(superAb.can(Action.Update, ArticleLikeEntity)).toBeTruthy();
      expect(superAb.cannot(Action.Update, new ArticleLikeEntity())).toBeTruthy();
      expect(superAb.can(Action.Update, ArticleLikeEntity.modelName)).toBeTruthy();
    });
  });

  const article = new ArticleEntity();
  article.status = ArticleEntity.STATE.public;
  article.deletedAt = null;

  const articleLike = new ArticleLikeEntity();
  articleLike.article = article;

  it('可点赞公开文章', () => {
    article.status = ArticleEntity.STATE.public;
    expect(commonAb.can(Action.Create, articleLike)).toBeTruthy();
  });
  it('不可点赞非公开文章', () => {
    article.status = ArticleEntity.STATE.private;
    expect(commonAb.cannot(Action.Create, articleLike)).toBeTruthy();
    expect(commonAb.cannot(Action.Update, articleLike)).toBeTruthy();
    article.status = ArticleEntity.STATE.public;
  });
  it('不可更改他人点赞', () => {
    articleLike.userId = admin.id;
    expect(commonAb.cannot(Action.Update, articleLike)).toBeTruthy();
  });
  it('不可点赞已删除文章', () => {
    article.deletedAt = new Date();
    expect(superAb.cannot(Action.Create, articleLike)).toBeTruthy();
    expect(superAb.cannot(Action.Update, articleLike)).toBeTruthy();
  });
});
