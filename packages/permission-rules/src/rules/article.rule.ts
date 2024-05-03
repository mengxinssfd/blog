import { ArticleEntity, USER_ROLE } from '@blog/entities';
import { Action, type RuleCreator } from '../types';

const Article = [ArticleEntity, ArticleEntity.modelName];

export const createArticleRule: RuleCreator = (user, { can, cannot }) => {
  // 所有人(包括未登录)都可查看
  can(Action.Read, Article);

  // dev及以上权限可新增
  if ([USER_ROLE.admin, USER_ROLE.dev].includes(user.role)) {
    can(Action.Create, Article);
  }

  if ([USER_ROLE.dev, USER_ROLE.commonUser, undefined].includes(user.role)) {
    // 非管理员非作者不可查看未发布文章
    cannot(Action.Read, ArticleEntity, {
      status: ArticleEntity.STATE.private,
      authorId: { $ne: user.id },
    }).because('文章不存在');

    // 已删除的文章直接不显示
    cannot(Action.Read, ArticleEntity, {
      deletedAt: { $ne: null },
      // authorId: { $ne: user.id },
    }).because('文章不存在');
  }

  // dev权限只能删改自己的
  if ([USER_ROLE.dev].includes(user.role)) {
    can(Action.Delete, Article);
    can(Action.Update, Article);

    cannot(Action.Update, ArticleEntity, {
      authorId: { $ne: user.id },
    }).because('只能修改自己创建的文章');

    cannot(Action.Delete, ArticleEntity, {
      authorId: { $ne: user.id },
    }).because('只能删除自己创建的文章');
  }

  // admin及以上权限可删改所有
  if ([USER_ROLE.admin, USER_ROLE.superAdmin].includes(user.role)) {
    can([Action.Update, Action.Delete], Article);
  }
};
