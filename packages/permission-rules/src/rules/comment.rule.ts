import { ArticleEntity, CommentEntity, UserEntity } from '@blog/entities';
import { Action, RuleCreator } from '../types';

const Comment = [CommentEntity, CommentEntity.modelName];

type RequiredCommentEntity = Required<CommentEntity>;

type FlatCE = CommentEntity & {
  'article.deletedAt': CommentEntity['article']['deletedAt'];
  'article.as': CommentEntity['article']['as'];
  'article.status': CommentEntity['article']['status'];
  'article.commentLock': CommentEntity['article']['commentLock'];
  'reply.deletedAt': RequiredCommentEntity['reply']['deletedAt'];
};

export const createCommentRule: RuleCreator = (user, { can, cannot }) => {
  can([Action.Create, Action.Read], Comment);

  if (user?.muted) {
    cannot([Action.Update, Action.Create], Comment).because('你已被禁言，可联系管理员解除禁言');
  }

  cannot<FlatCE>(Action.Create, CommentEntity, {
    'reply.deletedAt': { $nin: [null, undefined] as any },
    replyId: { $nin: [null, undefined] as any },
  }).because('回复的评论不存在');

  if (user.id) {
    can([Action.Update, Action.Delete], Comment);
  }

  if ([UserEntity.ROLE.commonUser, UserEntity.ROLE.dev].includes(user.role) || !user.id) {
    cannot(Action.Update, CommentEntity, { userId: { $ne: user.id } }).because(
      '不可更改其他账号的评论',
    );
    cannot(Action.Delete, CommentEntity, { userId: { $ne: user.id } }).because(
      '不可删除其他账号的评论',
    );

    cannot<FlatCE>([Action.Update, Action.Create], CommentEntity, {
      'article.commentLock': true,
    }).because('该文章禁止评论');

    cannot<FlatCE>([Action.Update, Action.Create], CommentEntity, {
      articleId: { $ne: null },
      'article.status': ArticleEntity.STATE.private,
      'article.as': null,
    }).because('文章不存在');

    cannot<FlatCE>([Action.Update, Action.Create], CommentEntity, {
      'article.deletedAt': { $ne: null },
      articleId: { $ne: null },
    }).because('不可添加或修改已删除文章的评论');
  }
};
