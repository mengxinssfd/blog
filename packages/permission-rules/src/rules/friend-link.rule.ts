import { FriendLinkEntity, USER_ROLE } from '@blog/entities';
import { Action, type RuleCreator } from '../types';

const FriendLink = [FriendLinkEntity, FriendLinkEntity.modelName];

export const createFriendLinkRule: RuleCreator = (user, { can }) => {
  can([Action.Create, Action.Read], FriendLink);

  if (user.role === USER_ROLE.admin) {
    can([Action.Update, Action.Delete], FriendLink);
  }
};
