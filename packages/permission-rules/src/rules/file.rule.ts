import { USER_ROLE, FileEntity } from '@blog/entities';
import { Action, type RuleCreator } from '../types';

const File = [FileEntity, FileEntity.modelName] as const;

export const createFileRule: RuleCreator = (user, { can }) => {
  can(Action.Read, File);

  if ([USER_ROLE.dev, USER_ROLE.admin].includes(user.role)) {
    can(Action.Create, File);
  }

  if (USER_ROLE.admin === user.role) {
    can(Action.Delete, File);
  }
};
