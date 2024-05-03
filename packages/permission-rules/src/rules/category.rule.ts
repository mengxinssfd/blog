import { CategoryEntity, ROLE } from '@blog/entities';
import { Action, type RuleCreator } from '../types';

const Category = [CategoryEntity, CategoryEntity.modelName];

export const createCategoryRule: RuleCreator = (user, { can, cannot }) => {
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
};
