import { ROLE, TagEntity } from '@blog/entities';
import { Action, RuleCreator } from '../types';

const Tag = [TagEntity, TagEntity.modelName];

export const createTagRule: RuleCreator = (user, { can, cannot }) => {
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
    }).because('只能修改自己创建的标签');

    cannot(Action.Delete, TagEntity, {
      createById: { $ne: user.id },
    }).because('只能删除自己创建的标签');
  }

  // admin及以上权限可删改所有
  if ([ROLE.admin, ROLE.superAdmin].includes(user.role)) {
    can([Action.Update, Action.Delete], Tag);
  }
  // 当该tag下有文章时，不被可删除
  cannot(Action.Delete, TagEntity, { articleCount: { $ne: 0 } }).because(
    '该标签有被使用，不可删除！',
  );
};
