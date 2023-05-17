import { MemoryHelperEntity, ROLE } from '@blog/entities';
import { Action, RuleCreator } from '../types';

const MemoryHelp = [MemoryHelperEntity, MemoryHelperEntity.modelName];

export const createMemoryHelpRule: RuleCreator = (user, { can, cannot }) => {
  can(Action.Read, MemoryHelp);

  if (user.role === ROLE.dev) {
    can(Action.Create, MemoryHelp);
    can([Action.Update, Action.Delete], MemoryHelp);
    cannot(Action.Update, MemoryHelperEntity, { creatorId: { $ne: user.id } }).because('无权修改');
    cannot(Action.Delete, MemoryHelperEntity, { creatorId: { $ne: user.id } }).because('无权删除');
  }

  if (user.role === ROLE.admin) {
    can([Action.Create, Action.Delete, Action.Update], MemoryHelp);
  }
};
