import { ArticleEntity } from '@blog/entities';
import { getRoles } from './utils';
import { Action, CaslAbilityFactory } from '../src';
import { ForbiddenError } from '@casl/ability';

describe('ArticleEntity', function () {
  const { superAdmin, admin, dev, commonUser1 } = getRoles();
  const factory = new CaslAbilityFactory();

  const commonAb = factory.createForUser(commonUser1);
  const devAb = factory.createForUser(dev);
  const adminAb = factory.createForUser(admin);
  const superAb = factory.createForUser(superAdmin);

  describe('dev-', function () {
    it('不可增删改', function () {
      expect(commonAb.cannot(Action.Create, ArticleEntity)).toBeTruthy();
      expect(commonAb.cannot(Action.Create, new ArticleEntity())).toBeTruthy();
      expect(commonAb.cannot(Action.Create, ArticleEntity.modelName)).toBeTruthy();

      expect(commonAb.cannot(Action.Update, ArticleEntity)).toBeTruthy();
      expect(commonAb.cannot(Action.Update, new ArticleEntity())).toBeTruthy();
      expect(commonAb.cannot(Action.Update, ArticleEntity.modelName)).toBeTruthy();

      expect(commonAb.cannot(Action.Delete, ArticleEntity)).toBeTruthy();
      expect(commonAb.cannot(Action.Delete, new ArticleEntity())).toBeTruthy();
      expect(commonAb.cannot(Action.Delete, ArticleEntity.modelName)).toBeTruthy();
    });
    it('不可查看非公开文章', () => {
      const article = new ArticleEntity();
      article.status = ArticleEntity.STATE.private;
      article.deletedAt = null;

      expect(commonAb.cannot(Action.Read, article)).toBeTruthy();
    });
    it('不可查看已删除文章', () => {
      const article = new ArticleEntity();
      article.status = ArticleEntity.STATE.public;
      article.deletedAt = new Date();

      expect(commonAb.cannot(Action.Read, article)).toBeTruthy();
    });
  });
  describe('dev', function () {
    it('可增删改', function () {
      expect(devAb.can(Action.Create, ArticleEntity)).toBeTruthy();
      expect(devAb.can(Action.Create, ArticleEntity.modelName)).toBeTruthy();
      expect(devAb.can(Action.Create, new ArticleEntity())).toBeTruthy();

      expect(devAb.can(Action.Update, ArticleEntity.modelName)).toBeTruthy();
      // 传class或实例不行，是因为authorId不等于dev.id
      try {
        ForbiddenError.from(devAb).throwUnlessCan(Action.Update, ArticleEntity);
      } catch (e) {
        console.log(e);
      }
      expect(devAb.can(Action.Update, ArticleEntity)).toBeTruthy();
      expect(devAb.cannot(Action.Update, new ArticleEntity())).toBeTruthy();

      expect(devAb.can(Action.Delete, ArticleEntity.modelName)).toBeTruthy();
      // 传class或实例不行，是因为authorId不等于dev.id
      // expect(devAb.cannot(Action.Delete, ArticleEntity)).toBeTruthy();
      expect(devAb.cannot(Action.Delete, new ArticleEntity())).toBeTruthy();
    });
    it('不可删改其他账号创建的', function () {
      const article = new ArticleEntity();
      article.authorId = admin.id;
      expect(devAb.cannot(Action.Update, article)).toBeTruthy();
      expect(devAb.cannot(Action.Delete, article)).toBeTruthy();
      expect(devAb.cannot(Action.Update, article, 'status')).toBeTruthy();
    });
    it('不可查看非公开文章', () => {
      const article = new ArticleEntity();
      article.status = ArticleEntity.STATE.private;
      article.deletedAt = null;

      expect(devAb.cannot(Action.Read, article)).toBeTruthy();
    });
    it('可查看自己写的非公开文章', () => {
      const article = new ArticleEntity();
      article.status = ArticleEntity.STATE.private;
      article.authorId = dev.id;
      article.deletedAt = null;

      expect(devAb.can(Action.Read, article)).toBeTruthy();
    });
    it('不可查看已删除文章', () => {
      const article = new ArticleEntity();
      article.status = ArticleEntity.STATE.public;
      article.deletedAt = new Date();

      expect(devAb.cannot(Action.Read, article)).toBeTruthy();
    });
  });
  describe('admin+', function () {
    it('可增删改', function () {
      // admin
      expect(adminAb.can(Action.Create, ArticleEntity)).toBeTruthy();
      expect(adminAb.can(Action.Create, ArticleEntity.modelName)).toBeTruthy();
      expect(adminAb.can(Action.Create, new ArticleEntity())).toBeTruthy();

      expect(adminAb.can(Action.Update, ArticleEntity)).toBeTruthy();
      expect(adminAb.can(Action.Update, ArticleEntity.modelName)).toBeTruthy();
      expect(adminAb.can(Action.Update, new ArticleEntity())).toBeTruthy();

      expect(adminAb.can(Action.Delete, ArticleEntity)).toBeTruthy();
      expect(adminAb.can(Action.Delete, ArticleEntity.modelName)).toBeTruthy();
      // expect(adminAb.can(Action.Delete, new ArticleEntity())).toBeTruthy();

      // super admin
      expect(superAb.can(Action.Create, ArticleEntity)).toBeTruthy();
      expect(superAb.can(Action.Create, ArticleEntity.modelName)).toBeTruthy();
      expect(superAb.can(Action.Create, new ArticleEntity())).toBeTruthy();

      expect(superAb.can(Action.Update, ArticleEntity)).toBeTruthy();
      expect(superAb.can(Action.Update, ArticleEntity.modelName)).toBeTruthy();
      expect(superAb.can(Action.Update, new ArticleEntity())).toBeTruthy();

      expect(superAb.can(Action.Delete, ArticleEntity)).toBeTruthy();
      expect(superAb.can(Action.Delete, ArticleEntity.modelName)).toBeTruthy();
      // expect(superAb.can(Action.Delete, new ArticleEntity())).toBeTruthy();
    });
    it('可删改其他账号创建的', function () {
      const article = new ArticleEntity();
      article.authorId = commonUser1.id;

      expect(adminAb.can(Action.Update, article)).toBeTruthy();
      expect(adminAb.can(Action.Delete, article)).toBeTruthy();

      expect(superAb.can(Action.Update, article)).toBeTruthy();
      expect(superAb.can(Action.Delete, article)).toBeTruthy();
    });
  });
  describe('all', function () {
    it('都可查看', function () {
      expect(commonAb.can(Action.Read, ArticleEntity.modelName)).toBeTruthy();
      expect(devAb.can(Action.Read, ArticleEntity.modelName)).toBeTruthy();
      expect(adminAb.can(Action.Read, ArticleEntity.modelName)).toBeTruthy();
      expect(superAb.can(Action.Read, ArticleEntity.modelName)).toBeTruthy();

      const article = new ArticleEntity();
      article.status = ArticleEntity.STATE.public;
      article.deletedAt = null;
      expect(commonAb.can(Action.Read, article)).toBeTruthy();
      expect(devAb.can(Action.Read, article)).toBeTruthy();
      expect(adminAb.can(Action.Read, article)).toBeTruthy();
      expect(superAb.can(Action.Read, article)).toBeTruthy();
    });
  });
});
