import { TagEntity } from '@blog/entities';
import { getRoles } from './utils';
import { Action, CaslAbilityFactory } from '../src';

describe('TagEntity', function () {
  const { superAdmin, admin, dev, commonUser1 } = getRoles();
  const factory = new CaslAbilityFactory();

  const commonAb = factory.createForUser(commonUser1);
  const devAb = factory.createForUser(dev);
  const adminAb = factory.createForUser(admin);
  const superAb = factory.createForUser(superAdmin);

  describe('dev-', function () {
    it('不可增删改', function () {
      expect(commonAb.cannot(Action.Create, TagEntity)).toBeTruthy();
      expect(commonAb.cannot(Action.Create, new TagEntity())).toBeTruthy();
      expect(commonAb.cannot(Action.Create, TagEntity.modelName)).toBeTruthy();

      expect(commonAb.cannot(Action.Update, TagEntity)).toBeTruthy();
      expect(commonAb.cannot(Action.Update, new TagEntity())).toBeTruthy();
      expect(commonAb.cannot(Action.Update, TagEntity.modelName)).toBeTruthy();

      expect(commonAb.cannot(Action.Delete, TagEntity)).toBeTruthy();
      expect(commonAb.cannot(Action.Delete, new TagEntity())).toBeTruthy();
      expect(commonAb.cannot(Action.Delete, TagEntity.modelName)).toBeTruthy();
    });
  });
  describe('dev', function () {
    it('可增删改', function () {
      expect(devAb.can(Action.Create, TagEntity)).toBeTruthy();
      expect(devAb.can(Action.Create, TagEntity.modelName)).toBeTruthy();
      expect(devAb.can(Action.Create, new TagEntity())).toBeTruthy();

      expect(devAb.can(Action.Update, TagEntity.modelName)).toBeTruthy();
      // 传class或实例不行，是因为createById不等于dev.id
      expect(devAb.cannot(Action.Update, TagEntity)).toBeTruthy();
      expect(devAb.cannot(Action.Update, new TagEntity())).toBeTruthy();

      expect(devAb.can(Action.Delete, TagEntity.modelName)).toBeTruthy();
      // 传class或实例不行，是因为createById不等于dev.id
      expect(devAb.cannot(Action.Delete, TagEntity)).toBeTruthy();
      expect(devAb.cannot(Action.Delete, new TagEntity())).toBeTruthy();
    });
    it('不可删改其他账号创建的', function () {
      const cate = new TagEntity();
      cate.createById = admin.id;
      expect(devAb.cannot(Action.Update, cate)).toBeTruthy();
      expect(devAb.cannot(Action.Delete, cate)).toBeTruthy();
    });
  });
  describe('admin+', function () {
    it('可增删改', function () {
      // admin
      expect(adminAb.can(Action.Create, TagEntity)).toBeTruthy();
      expect(adminAb.can(Action.Create, TagEntity.modelName)).toBeTruthy();
      expect(adminAb.can(Action.Create, new TagEntity())).toBeTruthy();

      expect(adminAb.can(Action.Update, TagEntity)).toBeTruthy();
      expect(adminAb.can(Action.Update, TagEntity.modelName)).toBeTruthy();
      expect(adminAb.can(Action.Update, new TagEntity())).toBeTruthy();

      expect(adminAb.can(Action.Delete, TagEntity)).toBeTruthy();
      expect(adminAb.can(Action.Delete, TagEntity.modelName)).toBeTruthy();
      // expect(adminAb.can(Action.Delete, new TagEntity())).toBeTruthy();

      // super admin
      expect(superAb.can(Action.Create, TagEntity)).toBeTruthy();
      expect(superAb.can(Action.Create, TagEntity.modelName)).toBeTruthy();
      expect(superAb.can(Action.Create, new TagEntity())).toBeTruthy();

      expect(superAb.can(Action.Update, TagEntity)).toBeTruthy();
      expect(superAb.can(Action.Update, TagEntity.modelName)).toBeTruthy();
      expect(superAb.can(Action.Update, new TagEntity())).toBeTruthy();

      expect(superAb.can(Action.Delete, TagEntity)).toBeTruthy();
      expect(superAb.can(Action.Delete, TagEntity.modelName)).toBeTruthy();
      // expect(superAb.can(Action.Delete, new TagEntity())).toBeTruthy();
    });
    it('可删改其他账号创建的', function () {
      const cate = new TagEntity();
      cate.createById = commonUser1.id;
      cate.articleCount = 0;

      expect(adminAb.can(Action.Update, cate)).toBeTruthy();
      expect(adminAb.can(Action.Delete, cate)).toBeTruthy();

      expect(superAb.can(Action.Update, cate)).toBeTruthy();
      expect(superAb.can(Action.Delete, cate)).toBeTruthy();
    });
  });
  describe('all', function () {
    it('都可查看', function () {
      expect(commonAb.can(Action.Read, TagEntity.modelName)).toBeTruthy();
      expect(devAb.can(Action.Read, TagEntity.modelName)).toBeTruthy();
      expect(adminAb.can(Action.Read, TagEntity.modelName)).toBeTruthy();
      expect(superAb.can(Action.Read, TagEntity.modelName)).toBeTruthy();
    });
    it('都不可删除有文章用了的标签', function () {
      const cate = new TagEntity();
      cate.createById = commonUser1.id;
      cate.articleCount = 1;

      expect(commonAb.cannot(Action.Delete, cate)).toBeTruthy();
      expect(devAb.cannot(Action.Delete, cate)).toBeTruthy();
      expect(adminAb.cannot(Action.Delete, cate)).toBeTruthy();
      expect(superAb.cannot(Action.Delete, cate)).toBeTruthy();
    });
  });
});
