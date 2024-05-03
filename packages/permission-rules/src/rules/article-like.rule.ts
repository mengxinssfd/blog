import { ArticleEntity, ArticleLikeEntity } from '@blog/entities';
import { Action, type RuleCreator } from '../types';

const ArticleLike = [ArticleLikeEntity, ArticleLikeEntity.modelName];

export const createArticleLikeRule: RuleCreator = (user, { can, cannot }) => {
  can([Action.Create, Action.Update, Action.Read], ArticleLike);

  cannot(Action.Update, ArticleLikeEntity, { userId: { $ne: user.id } }).because(
    '不可更改其他账号的点赞',
  );

  type FlatAL = ArticleLikeEntity & {
    'article.deletedAt': ArticleLikeEntity['article']['deletedAt'];
    'article.status': ArticleLikeEntity['article']['status'];
  };

  cannot<FlatAL>([Action.Update, Action.Create], ArticleLikeEntity, {
    'article.status': ArticleEntity.STATE.private,
  }).because('不可添加或修改私有文章的点赞');

  cannot<FlatAL>([Action.Update, Action.Create], ArticleLikeEntity, {
    'article.deletedAt': { $ne: null },
  }).because('不可添加或修改已删除文章的点赞');
};
