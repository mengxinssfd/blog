import { ROLE, UserEntity } from '@blog/entities';
import {
  AbilityBuilder,
  AbilityOptionsOf,
  createMongoAbility,
  InferSubjects,
  MongoAbility,
} from '@casl/ability';
import { Action } from '../src';
import { RuleCreator } from '../src/utils';
import type { BaseEntity } from 'typeorm';

export class CaslAbilityFactory<T extends typeof BaseEntity> {
  private readonly classMap: Record<string, T>;
  constructor(private ruleCreator: RuleCreator, entity: T) {
    this.classMap = { [entity['modelName']]: entity };
  }
  createForUser(user: UserEntity): MongoAbility<[Action, InferSubjects<T, true> | 'all']> {
    // 参考文档：https://casl.js.org/v6/en/guide/restricting-fields
    const options: AbilityOptionsOf<MongoAbility<[Action, T]>> = {
      detectSubjectType: (subject) => {
        const matched = this.classMap[subject['__caslSubjectType__']];
        if (matched) {
          // 非class实例转成实例
          const ext = Object.assign(new (matched as any)(), subject);
          delete ext['__caslSubjectType__'];
          subject = ext;
        }
        return subject.constructor as any;
      },
    };

    const builder = new AbilityBuilder(createMongoAbility);

    const { can, rules } = builder;

    if (user.role === ROLE.superAdmin) {
      can(Action.Manage, 'all'); // read-write access to everything
    }

    this.ruleCreator(user, builder);

    return createMongoAbility<any>(
      // json原始规则
      rules,
      options,
    );
  }
}

export function getRoles() {
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

  return { superAdmin, admin, dev, commonUser1, commonUser2 };
}
