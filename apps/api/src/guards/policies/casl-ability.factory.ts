import { ROLE, UserEntity, CategoryEntity, TagEntity } from '@blog/entities';
import {
  AbilityBuilder,
  AbilityOptionsOf,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { createTagRule, createUserRule, createCategoryRule, Action } from '@blog/permission-rules';

type Subjects =
  | InferSubjects<typeof UserEntity | typeof CategoryEntity | typeof TagEntity, true>
  | 'all';

export type AppAbility = MongoAbility<[Action, Subjects]>;

const classMap = {
  [UserEntity.modelName]: UserEntity,
  [CategoryEntity.modelName]: CategoryEntity,
  [TagEntity.modelName]: TagEntity,
};

/**
 * @tips 不要传class进来；要么传class的实例，要么传class的modelName
 */
@Injectable()
export class CaslAbilityFactory {
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

    createUserRule(user, builder);
    createCategoryRule(user, builder);
    createTagRule(user, builder);

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
