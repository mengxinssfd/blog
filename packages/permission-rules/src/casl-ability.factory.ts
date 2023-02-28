import { ROLE, UserEntity, CategoryEntity, TagEntity, ArticleEntity } from '@blog/entities';
import {
  AbilityBuilder,
  AbilityOptionsOf,
  AnyMongoAbility,
  createMongoAbility,
  ExtractSubjectType,
  ForbiddenError,
  InferSubjects,
  MongoAbility,
} from '@casl/ability';
import { Action } from './utils';
import { createUserRule } from './rules/user';
import { createCategoryRule } from './rules/category';
import { createTagRule } from './rules/tag';
import { createArticleRule } from './rules/article';

type Subjects =
  | InferSubjects<
      typeof UserEntity | typeof CategoryEntity | typeof TagEntity | typeof ArticleEntity,
      true
    >
  | 'all';

export type AppAbility = MongoAbility<[Action, Subjects]>;

const classMap = {
  [UserEntity.modelName]: UserEntity,
  [CategoryEntity.modelName]: CategoryEntity,
  [TagEntity.modelName]: TagEntity,
};

function bootstrap(user: UserEntity, builder: AbilityBuilder<AnyMongoAbility>) {
  createUserRule(user, builder);
  createCategoryRule(user, builder);
  createTagRule(user, builder);
  createArticleRule(user, builder);
}

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

    bootstrap(user, builder);

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

  find<T extends Subjects>(something: () => Promise<T>) {
    let ability: AppAbility;
    const can = async (action: Action, field?: keyof T) => {
      const st = await something();

      ForbiddenError.from(ability).throwUnlessCan(action, st, field as string);

      return st;
    };
    const unless = (loginUser: UserEntity) => {
      ability = this.createForUser(loginUser);
      return { can, raw: ability };
    };

    return { unless };
  }

  // /**
  //  * 检查字段用
  //  * ---
  //  * casl原来的不太准确，见article rule
  //  * 当单个规则和整体规则冲突的时候就得用这个方法
  //  *
  //  * @param ability
  //  */
  // use(ability: AppAbility) {
  //   return {
  //     can: <T extends Subjects>(action: Action, subject: T, fields: (keyof T)[]): boolean => {
  //       const fieldList = permittedFieldsOf(ability, action, subject, {
  //         fieldsFrom: (rule) => rule.fields || (fields as string[]),
  //       });
  //       if (!fields.length) return Boolean(fieldList.length);
  //       return fieldList.some((field) => fields.includes(field as any));
  //     },
  //   };
  // }
}
