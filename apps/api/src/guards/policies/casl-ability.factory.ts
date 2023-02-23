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

type Subjects =
  | InferSubjects<typeof UserEntity | typeof CategoryEntity | typeof TagEntity, true>
  | 'all';

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
  [CategoryEntity.modelName]: CategoryEntity,
  [TagEntity.modelName]: TagEntity,
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

    if (![ROLE.superAdmin, ROLE.admin].includes(user.role)) {
      can(Action.Update, UserEntity, { id: user.id }).because(
        '只有该用户或管理员才可以更新自己的信息',
      );
      cannot(Action.Update, UserEntity, { id: { $ne: user.id } }).because('禁止修改其他账号信息');
      cannot(Action.Update, UserEntity, 'password', { id: { $ne: user.id } }).because(
        '禁止修改其它账号的密码',
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
  private createCategoryRule(user: UserEntity, { can, cannot }: AbilityBuilder<AppAbility>) {
    const Category = [CategoryEntity, CategoryEntity.modelName];

    // 所有人都可查看
    can(Action.Read, Category);

    // dev及以上权限可新增cate
    if ([ROLE.admin, ROLE.dev].includes(user.role)) {
      can(Action.Create, Category);
    }

    // dev权限只能删改自己的
    if ([ROLE.dev].includes(user.role)) {
      // modelName与class的区别：
      // - modelName：有没有权限更新或删除分类？--有；
      // - class：有没有权限更新或删除分类？--有，但前提是自己创建的
      // 总之：modelName广泛，class细致

      can(Action.Update, CategoryEntity.modelName);
      can(Action.Delete, CategoryEntity.modelName);

      cannot(Action.Update, CategoryEntity, {
        createById: { $ne: user.id },
      }).because('只能修改自己创建的分类');

      cannot(Action.Delete, CategoryEntity, {
        createById: { $ne: user.id },
      }).because('只能删除自己创建的分类');
    }

    // admin及以上权限可删改所有
    if ([ROLE.admin, ROLE.superAdmin].includes(user.role)) {
      can([Action.Update, Action.Delete], Category);
    }
    // 当该分类下有文章时，所有人都不可删除该分类
    cannot(Action.Delete, CategoryEntity, { articleCount: { $ne: 0 } }).because(
      '该分类有被文章使用，可先把这些文章改为其他分类再执行删除操作',
    );
  }
  private createTagRule(user: UserEntity, { can, cannot }: AbilityBuilder<AppAbility>) {
    const Tag = [TagEntity, TagEntity.modelName];

    // 所有人都可查看
    can(Action.Read, Tag);

    // dev及以上权限可新增tag
    if ([ROLE.admin, ROLE.dev].includes(user.role)) {
      can(Action.Create, Tag);
    }

    // dev权限只能删改自己的
    if ([ROLE.dev].includes(user.role)) {
      can(Action.Update, TagEntity.modelName);
      can(Action.Delete, TagEntity.modelName);

      cannot(Action.Update, TagEntity, {
        createById: { $ne: user.id },
      }).because('只能修改自己创建的tag');

      cannot(Action.Delete, TagEntity, {
        createById: { $ne: user.id },
      }).because('只能删除自己创建的tag');
    }

    // admin及以上权限可删改所有
    if ([ROLE.admin, ROLE.superAdmin].includes(user.role)) {
      can([Action.Update, Action.Delete], Tag);
    }
    // 当该tag下有文章时，不被可删除
    cannot(Action.Delete, TagEntity, { articleCount: { $ne: 0 } }).because(
      '该tag有被使用，禁止删除',
    );
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
    this.createCategoryRule(user, builder);
    this.createTagRule(user, builder);

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
