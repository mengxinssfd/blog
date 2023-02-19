import { ROLE, UserEntity } from '@blog/entities';
import { Action, CaslAbilityFactory } from '@/guards/policies/casl-ability.factory';
import { subject } from '@casl/ability';
import { permittedFieldsOf } from '@casl/ability/extra';

describe('CaslAbilityFactory', function () {
  const superAdmin = new UserEntity();
  superAdmin.role = ROLE.superAdmin;
  superAdmin.id = 1;

  const commonUser1 = new UserEntity();
  commonUser1.role = ROLE.commonUser;
  commonUser1.id = 2;

  const commonUser2 = new UserEntity();
  commonUser2.role = ROLE.commonUser;
  commonUser2.id = 3;

  describe('UserEntity', function () {
    const factory = new CaslAbilityFactory();
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
      it('可禁言任何人', () => {
        expect(ab.can(Action.Update, UserEntity.modelName, 'muted')).toBeTruthy();
        expect(ab.can(Action.Update, UserEntity, 'muted')).toBeTruthy();
        expect(ab.can(Action.Update, superAdmin, 'muted')).toBeTruthy();
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
});
