import { ArticleEntity, ROLE } from '@blog/entities';
import { Action, RuleCreator } from '../utils';

const Article = [ArticleEntity, ArticleEntity.modelName];

export const createArticleRule: RuleCreator = (user, { can, cannot }) => {
  // 所有人都可查看
  can(Action.Read, Article);

  // dev及以上权限可新增
  if ([ROLE.admin, ROLE.dev].includes(user.role)) {
    can(Action.Create, Article);
  }

  if ([ROLE.dev, ROLE.commonUser, undefined].includes(user.role)) {
    // 普通和dev权限的，非自己写的且未公开的文章直接不显示
    cannot(Action.Read, ArticleEntity, {
      status: ArticleEntity.STATE.private,
      authorId: { $ne: user.id },
    }).because('文章不存在');
    // 非自己写的且已删除的文章直接不显示
    cannot(Action.Read, ArticleEntity, {
      deletedAt: { $ne: null },
      authorId: { $ne: user.id },
    }).because('文章不存在');
  }

  // dev权限只能删改自己的
  if ([ROLE.dev].includes(user.role)) {
    can([Action.Update, Action.Delete], Article);

    cannot(Action.Update, ArticleEntity, {
      authorId: { $ne: user.id },
    }).because('只能修改自己创建的文章');

    cannot(Action.Delete, ArticleEntity, {
      authorId: { $ne: user.id },
    }).because('只能删除自己创建的文章');

    cannot(Action.Delete, ArticleEntity, 'commentLock', {
      authorId: { $ne: user.id },
    }).because('只能对自己创建的文章设置禁止评论');

    cannot(Action.Delete, ArticleEntity, 'viewCount', {
      authorId: user.id,
    }).because('不能为自己的文章添加点击量');
  }

  // admin及以上权限可删改所有
  if ([ROLE.admin, ROLE.superAdmin].includes(user.role)) {
    can([Action.Update, Action.Delete], Article);
  }
};
