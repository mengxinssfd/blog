import {
  USER_ROLE,
  UserEntity,
  CategoryEntity,
  TagEntity,
  ArticleEntity,
  ArticleLikeEntity,
  CommentEntity,
  CommentLikeEntity,
  CommentDislikeEntity,
  FriendLinkEntity,
  FileEntity,
  ProjectEntity,
  MemoryHelperEntity,
  SaysEntity,
  ProjectCategoryEntity,
} from '@blog/entities';
import {
  AbilityBuilder,
  type AbilityOptionsOf,
  createMongoAbility,
  type ExtractSubjectType,
  ForbiddenError,
  type MongoAbility,
} from '@casl/ability';
import { bootstrap } from './bootstrap';
import { Action } from './types';
import { createUserRule } from './rules/user.rule';
import { createCategoryRule } from './rules/category.rule';
import { createTagRule } from './rules/tag.rule';
import { createArticleRule } from './rules/article.rule';
import { createArticleLikeRule } from './rules/article-like.rule';
import { createCommentRule } from './rules/comment.rule';
import { createCommentLikeRule } from './rules/comment-like.rule';
import { createCommentDislikeRule } from './rules/comment-dislike.rule';
import { createFriendLinkRule } from './rules/friend-link.rule';
import { createFileRule } from './rules/file.rule';
import { createProjectRule } from './rules/project.rule';
import { createMemoryHelpRule } from './rules/memory-help.rule';
import { createSaysRule } from './rules/says.rule';
import { createProjectCategoryRule } from './rules/project-category.rule';

const { subjects, classMap, ruleRegister } = bootstrap(
  [
    UserEntity,
    CategoryEntity,
    TagEntity,
    ArticleEntity,
    ArticleLikeEntity,
    CommentEntity,
    CommentLikeEntity,
    CommentDislikeEntity,
    FriendLinkEntity,
    FileEntity,
    ProjectEntity,
    MemoryHelperEntity,
    SaysEntity,
    ProjectCategoryEntity,
  ],
  [
    createUserRule,
    createCategoryRule,
    createTagRule,
    createArticleRule,
    createArticleLikeRule,
    createCommentRule,
    createCommentLikeRule,
    createCommentDislikeRule,
    createFriendLinkRule,
    createFileRule,
    createProjectRule,
    createMemoryHelpRule,
    createSaysRule,
    createProjectCategoryRule,
  ],
);

export type Subjects = typeof subjects;
export type AppAbility = MongoAbility<[Action, Subjects]>;

export class CaslAbilityFactory {
  createForUser(user: UserEntity) {
    // 参考文档：https://casl.js.org/v6/en/guide/restricting-fields
    const options: AbilityOptionsOf<AppAbility> = {
      detectSubjectType: (subject) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const matched = classMap[subject['__caslSubjectType__']];
        if (matched) {
          // 非class实例转成实例
          const ext = Object.assign(new matched(), subject);
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          delete ext['__caslSubjectType__'];
          subject = ext;
        }
        return subject.constructor as ExtractSubjectType<Subjects>;
      },
    };

    const builder = new AbilityBuilder<AppAbility>(createMongoAbility);

    const { can, rules } = builder;

    if (user.role === USER_ROLE.superAdmin) {
      can(Action.Manage, 'all'); // read-write access to everything
    }

    ruleRegister(user, builder);

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
