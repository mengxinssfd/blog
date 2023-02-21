import { ROLE, UserEntity, CategoryEntity } from '@blog/entities';
import { Action, CaslAbilityFactory } from '@/guards/policies/casl-ability.factory';
import { ForbiddenError, subject } from '@casl/ability';
import { permittedFieldsOf } from '@casl/ability/extra';

describe('CaslAbilityFactory', function () {
  const superAdmin = new UserEntity();
  superAdmin.role = ROLE.superAdmin;
  superAdmin.id = 1;
  superAdmin.nickname = 'super admin';

  const commonUser1 = new UserEntity();
  commonUser1.role = ROLE.commonUser;
  commonUser1.id = 2;
  commonUser1.nickname = 'common user 1';

  const commonUser2 = new UserEntity();
  commonUser2.role = ROLE.commonUser;
  commonUser2.id = 3;
  commonUser2.nickname = 'common user 2';

  const dev = new UserEntity();
  dev.role = ROLE.dev;
  dev.id = 4;

  const admin = new UserEntity();
  admin.role = ROLE.admin;
  admin.id = 5;

  const factory = new CaslAbilityFactory();

  describe('UserEntity', function () {
    describe('superAdmin', function () {
      const ab = factory.createForUser(superAdmin);
      it('可管理User', () => {
        expect(ab.can(Action.Manage, UserEntity.modelName)).toBeTruthy();
        expect(ab.can(Action.Manage, UserEntity)).toBeTruthy();
      });
      it('可创建User', () => {
        expect(ab.can(Action.Create, UserEntity.modelName)).toBeTruthy();
        expect(ab.can(Action.Create, UserEntity)).toBeTruthy();
      });
      it('可获取所有人的信息', () => {
        expect(ab.can(Action.Read, UserEntity.modelName)).toBeTruthy();
        expect(ab.can(Action.Read, UserEntity)).toBeTruthy();
        expect(ab.can(Action.Read, superAdmin)).toBeTruthy();
        expect(ab.can(Action.Read, commonUser1)).toBeTruthy();
        expect(ab.can(Action.Read, commonUser2)).toBeTruthy();
      });
      it('可修改所有人的信息', () => {
        expect(ab.can(Action.Update, UserEntity.modelName)).toBeTruthy();
        expect(ab.can(Action.Update, UserEntity)).toBeTruthy();
        expect(ab.can(Action.Update, superAdmin)).toBeTruthy();
        expect(ab.can(Action.Update, commonUser1)).toBeTruthy();
        expect(ab.can(Action.Update, commonUser2)).toBeTruthy();
      });
      it('可删除除superAdmin以外的所有人', () => {
        expect(ab.can(Action.Delete, UserEntity.modelName)).toBeTruthy();
        expect(ab.can(Action.Delete, UserEntity)).toBeTruthy();
        expect(ab.can(Action.Delete, commonUser1)).toBeTruthy();
        expect(ab.can(Action.Delete, commonUser2)).toBeTruthy();
        expect(ab.cannot(Action.Delete, superAdmin)).toBeTruthy();
      });
      it('可禁言除superAdmin以外的任何人', () => {
        expect(ab.can(Action.Update, UserEntity.modelName, 'muted')).toBeTruthy();
        expect(ab.can(Action.Update, UserEntity, 'muted')).toBeTruthy();
        expect(ab.cannot(Action.Update, superAdmin, 'muted')).toBeTruthy();
        expect(ab.can(Action.Update, commonUser1, 'muted')).toBeTruthy();
        expect(ab.can(Action.Update, commonUser2, 'muted')).toBeTruthy();
      });
      const UserFields = ['password', 'salt', 'email', 'mobile'] as (keyof UserEntity)[];
      it('可获取任何人的私密信息', () => {
        function getFileds(subject: UserEntity | typeof UserEntity.modelName) {
          return permittedFieldsOf(ab, Action.Read, subject, {
            fieldsFrom: (rule) => rule.fields || UserFields,
          });
        }
        expect(getFileds(UserEntity.modelName)).toEqual(UserFields);
        expect(getFileds(superAdmin)).toEqual(UserFields);
        expect(getFileds(commonUser1)).toEqual(UserFields);
        expect(getFileds(commonUser2)).toEqual(UserFields);
      });
      it('可设置role', () => {
        expect(ab.can(Action.Update, UserEntity.modelName, 'role')).toBeTruthy();
        expect(ab.can(Action.Update, UserEntity, 'role')).toBeTruthy();
        expect(ab.can(Action.Update, superAdmin, 'role')).toBeTruthy();
        expect(ab.can(Action.Update, commonUser1, 'role')).toBeTruthy();
        expect(ab.can(Action.Update, commonUser2, 'role')).toBeTruthy();
      });
    });
    describe('commonUser', function () {
      const ab = factory.createForUser(commonUser1);
      it('不可获取user信息', () => {
        expect(ab.cannot(Action.Read, UserEntity.modelName)).toBeTruthy();
        // expect(ab.cannot(Action.Read, UserEntity)).toBeTruthy();
      });
      it('可获取自己的详细信息', () => {
        expect(ab.can(Action.Read, commonUser1)).toBeTruthy();
      });
      it('可获取别人的详细信息', () => {
        expect(ab.can(Action.Read, commonUser2)).toBeTruthy();
      });
      const UserFields = ['password', 'salt', 'email', 'mobile'] as (keyof UserEntity)[];
      it('可获取自己的私密信息', () => {
        expect(
          permittedFieldsOf(ab, Action.Read, commonUser1, {
            fieldsFrom: (rule) => rule.fields || UserFields,
          }),
        ).toEqual(['mobile', 'password', 'email']);
        expect(ab.can(Action.Read, commonUser1, 'mobile')).toBeTruthy();
      });
      it('不可获取别人的私密信息', () => {
        expect(
          permittedFieldsOf(ab, Action.Read, commonUser2, {
            fieldsFrom: (rule) => rule.fields || UserFields,
          }),
        ).toEqual([]);
        expect(ab.cannot(Action.Read, commonUser2, 'mobile')).toBeTruthy();
      });
      it('可修改自己', () => {
        expect(ab.can(Action.Update, commonUser1)).toBeTruthy();
        expect(ab.cannot(Action.Update, { id: commonUser1.id } as any)).toBeTruthy();
        expect(
          ab.can(Action.Update, subject(UserEntity.modelName, { id: commonUser1.id } as any)),
        ).toBeTruthy();
      });
      it('不可修改他人', () => {
        expect(ab.cannot(Action.Update, { id: commonUser2.id } as any)).toBeTruthy();
        expect(ab.cannot(Action.Update, commonUser2)).toBeTruthy();
        expect(ab.cannot(Action.Update, UserEntity.modelName)).toBeTruthy();
        // expect(ab.cannot(Action.Update, UserEntity)).toBeTruthy();
      });
      it('不可禁言任何人', () => {
        expect(ab.cannot(Action.Update, UserEntity.modelName, 'muted')).toBeTruthy();
        expect(ab.cannot(Action.Update, UserEntity, 'muted')).toBeTruthy();
        expect(ab.cannot(Action.Update, superAdmin, 'muted')).toBeTruthy();
        expect(ab.cannot(Action.Update, commonUser1, 'muted')).toBeTruthy();
        expect(ab.cannot(Action.Update, commonUser2, 'muted')).toBeTruthy();
        expect(() => {
          // 注意⚠️： ForbiddenError.from().throwUnlessCan() 不能传string，需要传class
          ForbiddenError.from(ab).throwUnlessCan(Action.Update, UserEntity.modelName, 'muted');
        }).toThrowError('Cannot execute "update" on "UserEntity"');
        expect(() => {
          ForbiddenError.from(ab).throwUnlessCan(Action.Update, UserEntity, 'muted');
        }).toThrowError('管理员才可以修改用户是否禁言');
      });
      it('不可删除任何人', () => {
        expect(ab.cannot(Action.Delete, UserEntity.modelName)).toBeTruthy();
        expect(ab.cannot(Action.Delete, { modelName: UserEntity.modelName } as any)).toBeTruthy();
        expect(ab.cannot(Action.Delete, UserEntity)).toBeTruthy();
        expect(ab.cannot(Action.Delete, superAdmin)).toBeTruthy();
        expect(ab.cannot(Action.Delete, commonUser1)).toBeTruthy();
        expect(ab.cannot(Action.Delete, commonUser2)).toBeTruthy();
      });
      it('不可设置role', () => {
        expect(ab.cannot(Action.Update, UserEntity.modelName, 'role')).toBeTruthy();
        expect(ab.cannot(Action.Update, UserEntity, 'role')).toBeTruthy();
        expect(ab.cannot(Action.Update, superAdmin, 'role')).toBeTruthy();
        expect(ab.cannot(Action.Update, commonUser1, 'role')).toBeTruthy();
        expect(ab.cannot(Action.Update, commonUser2, 'role')).toBeTruthy();
      });
    });
  });
  describe('CategoryEntity', function () {
    const commonAb = factory.createForUser(commonUser1);
    const devAb = factory.createForUser(dev);
    const adminAb = factory.createForUser(admin);
    const superAb = factory.createForUser(superAdmin);

    describe('dev-', function () {
      it('不可增删改', function () {
        expect(commonAb.cannot(Action.Create, CategoryEntity)).toBeTruthy();
        expect(commonAb.cannot(Action.Create, new CategoryEntity())).toBeTruthy();
        expect(commonAb.cannot(Action.Create, CategoryEntity.modelName)).toBeTruthy();

        expect(commonAb.cannot(Action.Update, CategoryEntity)).toBeTruthy();
        expect(commonAb.cannot(Action.Update, new CategoryEntity())).toBeTruthy();
        expect(commonAb.cannot(Action.Update, CategoryEntity.modelName)).toBeTruthy();

        expect(commonAb.cannot(Action.Delete, CategoryEntity)).toBeTruthy();
        expect(commonAb.cannot(Action.Delete, new CategoryEntity())).toBeTruthy();
        expect(commonAb.cannot(Action.Delete, CategoryEntity.modelName)).toBeTruthy();
      });
    });
    describe('dev', function () {
      it('可增删改', function () {
        expect(devAb.can(Action.Create, CategoryEntity)).toBeTruthy();
        expect(devAb.can(Action.Create, CategoryEntity.modelName)).toBeTruthy();
        expect(devAb.can(Action.Create, new CategoryEntity())).toBeTruthy();

        expect(devAb.can(Action.Update, CategoryEntity.modelName)).toBeTruthy();
        // 传class或实例不行，是因为createById不等于dev.id
        expect(devAb.cannot(Action.Update, CategoryEntity)).toBeTruthy();
        expect(devAb.cannot(Action.Update, new CategoryEntity())).toBeTruthy();

        expect(devAb.can(Action.Delete, CategoryEntity.modelName)).toBeTruthy();
        // 传class或实例不行，是因为createById不等于dev.id
        expect(devAb.cannot(Action.Delete, CategoryEntity)).toBeTruthy();
        expect(devAb.cannot(Action.Delete, new CategoryEntity())).toBeTruthy();
      });
      it('不可删改其他账号创建的', function () {
        const cate = new CategoryEntity();
        cate.createById = admin.id;
        expect(devAb.cannot(Action.Update, cate)).toBeTruthy();
        expect(devAb.cannot(Action.Delete, cate)).toBeTruthy();
      });
    });
    describe('admin+', function () {
      it('可增删改', function () {
        // admin
        expect(adminAb.can(Action.Create, CategoryEntity)).toBeTruthy();
        expect(adminAb.can(Action.Create, CategoryEntity.modelName)).toBeTruthy();
        expect(adminAb.can(Action.Create, new CategoryEntity())).toBeTruthy();

        expect(adminAb.can(Action.Update, CategoryEntity)).toBeTruthy();
        expect(adminAb.can(Action.Update, CategoryEntity.modelName)).toBeTruthy();
        expect(adminAb.can(Action.Update, new CategoryEntity())).toBeTruthy();

        expect(adminAb.can(Action.Delete, CategoryEntity)).toBeTruthy();
        expect(adminAb.can(Action.Delete, CategoryEntity.modelName)).toBeTruthy();
        // expect(adminAb.can(Action.Delete, new CategoryEntity())).toBeTruthy();

        // super admin
        expect(superAb.can(Action.Create, CategoryEntity)).toBeTruthy();
        expect(superAb.can(Action.Create, CategoryEntity.modelName)).toBeTruthy();
        expect(superAb.can(Action.Create, new CategoryEntity())).toBeTruthy();

        expect(superAb.can(Action.Update, CategoryEntity)).toBeTruthy();
        expect(superAb.can(Action.Update, CategoryEntity.modelName)).toBeTruthy();
        expect(superAb.can(Action.Update, new CategoryEntity())).toBeTruthy();

        expect(superAb.can(Action.Delete, CategoryEntity)).toBeTruthy();
        expect(superAb.can(Action.Delete, CategoryEntity.modelName)).toBeTruthy();
        // expect(superAb.can(Action.Delete, new CategoryEntity())).toBeTruthy();
      });
      it('可删改其他账号创建的', function () {
        const cate = new CategoryEntity();
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
        expect(commonAb.can(Action.Read, CategoryEntity.modelName)).toBeTruthy();
        expect(devAb.can(Action.Read, CategoryEntity.modelName)).toBeTruthy();
        expect(adminAb.can(Action.Read, CategoryEntity.modelName)).toBeTruthy();
        expect(superAb.can(Action.Read, CategoryEntity.modelName)).toBeTruthy();
      });
      it('都不可删除有文章用了的分类', function () {
        const cate = new CategoryEntity();
        cate.createById = commonUser1.id;
        cate.articleCount = 1;

        expect(commonAb.cannot(Action.Delete, cate)).toBeTruthy();
        expect(devAb.cannot(Action.Delete, cate)).toBeTruthy();
        expect(adminAb.cannot(Action.Delete, cate)).toBeTruthy();
        expect(superAb.cannot(Action.Delete, cate)).toBeTruthy();
      });
    });
  });
});
