import { FriendLinkEntity, ROLE } from '@blog/entities';
import { Action, RuleCreator } from '../types';

const FriendLink = [FriendLinkEntity, FriendLinkEntity.modelName];

export const createFriendLinkRule: RuleCreator = (user, { can, cannot }) => {
  can([Action.Create, Action.Read, Action.Update], FriendLink);

  if (![ROLE.superAdmin, ROLE.admin].includes(user.role)) {
    cannot(Action.Update, FriendLinkEntity, { createBy: { $ne: user.id } }).because(
      '不可更改其他账号的友链',
    );
  }

  if (user.role === ROLE.admin) {
    can([Action.Update, Action.Delete], FriendLink);
  }
};
