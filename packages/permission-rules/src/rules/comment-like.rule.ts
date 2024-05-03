import { CommentLikeEntity, ROLE } from '@blog/entities';
import { Action, type RuleCreator } from '../types';

const Like = [CommentLikeEntity, CommentLikeEntity.modelName];

export const createCommentLikeRule: RuleCreator = (user, { can, cannot }) => {
  can([Action.Create, Action.Update, Action.Read], Like);

  if (![ROLE.superAdmin, ROLE.admin].includes(user.role)) {
    cannot(Action.Update, CommentLikeEntity, { userId: { $ne: user.id } }).because(
      '不可更改其他账号的点赞',
    );
  }
};
