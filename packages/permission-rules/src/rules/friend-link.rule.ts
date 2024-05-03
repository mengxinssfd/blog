import { FriendLinkEntity, ROLE } from '@blog/entities';
import { Action, type RuleCreator } from '../types';

const FriendLink = [FriendLinkEntity, FriendLinkEntity.modelName];

export const createFriendLinkRule: RuleCreator = (user, { can }) => {
  can([Action.Create, Action.Read], FriendLink);

  if (user.role === ROLE.admin) {
    can([Action.Update, Action.Delete], FriendLink);
  }
};
