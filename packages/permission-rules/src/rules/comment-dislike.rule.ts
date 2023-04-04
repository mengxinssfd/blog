import { CommentDislikeEntity } from '@blog/entities';
import { Action, RuleCreator } from '../types';

const Like = [CommentDislikeEntity, CommentDislikeEntity.modelName];

export const createCommentDislikeRule: RuleCreator = (user, { can, cannot }) => {
  can([Action.Create, Action.Update, Action.Read], Like);

  cannot(Action.Update, CommentDislikeEntity, { userId: { $ne: user.id } }).because(
    '不可更改其他账号的点赞',
  );
};
