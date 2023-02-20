import { ROLE, UserEntity } from '@blog/entities';
import {
  AbilityBuilder,
  AbilityOptionsOf,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';

type Subjects = InferSubjects<typeof UserEntity, true> | 'all';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type AppAbility = MongoAbility<[Action, Subjects]>;

const classMap = {
  [UserEntity.modelName]: UserEntity,
};

/**
 * @tips 不要传class进来；要么传class的实例，要么传class的modelName
 */
@Injectable()
export class CaslAbilityFactory {
  private createUserRule(user: UserEntity, { can, cannot }: AbilityBuilder<AppAbility>) {
    can(Action.Create, UserEntity);
    can(Action.Read, UserEntity);
    cannot(Action.Delete, UserEntity, { role: ROLE.superAdmin }).because(
      '不能删除superAdmin的账号',
    );
    cannot(Action.Update, UserEntity, 'muted', { role: ROLE.superAdmin }).because(
      '不能禁言superAdmin',
    );
    if (user.role !== ROLE.superAdmin) {
      can(Action.Update, UserEntity, { id: user.id }).because(
        '只有该用户或管理员才可以更新自己的信息',
      );
      cannot(Action.Update, UserEntity, 'muted').because('管理员才可以修改用户是否禁言');

      cannot(Action.Read, UserEntity, [
        'mobile',
        'password',
        'email',
        'salt',
        'registerIp',
      ]).because('只有该用户和管理员才可以获取用户的私密信息');
      can(Action.Read, UserEntity, ['mobile', 'password', 'email'], { id: user.id }).because(
        '只有该用户和管理员才可以获取用户的部分私密信息',
      );
      cannot(Action.Update, UserEntity, 'role').because('只有superAdmin才能设置role');
    }
  }
  createForUser(user: UserEntity) {
    // 参考文档：https://casl.js.org/v6/en/guide/restricting-fields
    const options: AbilityOptionsOf<AppAbility> = {
      detectSubjectType: (subject) => {
        const matched = classMap[subject['__caslSubjectType__']];
        if (matched) {
          // 非class实例转成实例
          const ext = Object.assign(new matched(), subject);
          delete ext['__caslSubjectType__'];
          subject = ext;
        }
        return subject.constructor as ExtractSubjectType<Subjects>;
      },
    };

    const builder = new AbilityBuilder<AppAbility>(createMongoAbility);

    const { can, rules } = builder;

    if (user.role === ROLE.superAdmin) {
      can(Action.Manage, 'all'); // read-write access to everything
    }

    this.createUserRule(user, builder);

    return createMongoAbility<AppAbility>(
      // json原始规则
      rules,
      options,
    );
  }
  // createForUser2(user: UserEntity) {
  //   // 参考文档：
  //   // - nest:  https://docs.nestjs.com/security/authorization#integrating-casl
  //   // - casl:  https://casl.js.org/v6/en/advanced/typescript
  //   const builder = new AbilityBuilder<AppAbility>(createMongoAbility);
  //   const { can, build } = builder;
  //
  //   if (user.role === ROLE.superAdmin) {
  //     can(Action.Manage, 'all'); // read-write access to everything
  //   }
  //
  //   this.createUserRule(user, builder);
  //
  //   return build({
  //     // Read https://casl.js.org/v5/en/guide/subject-type-detection#use-classes-as-subject-types for details
  //     detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>,
  //   });
  // }
}
