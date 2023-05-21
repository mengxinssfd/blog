import { CommentDislikeEntity } from '@blog/entities';
import { Action, RuleCreator } from '../types';

const Like = [CommentDislikeEntity, CommentDislikeEntity.modelName];

export const createCommentDislikeRule: RuleCreator = (_user, { can }) => {
  can([Action.Create, Action.Update, Action.Read], Like);
};
