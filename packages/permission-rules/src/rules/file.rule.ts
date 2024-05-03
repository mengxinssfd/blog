import { ROLE, FileEntity } from '@blog/entities';
import { Action, type RuleCreator } from '../types';

const File = [FileEntity, FileEntity.modelName] as const;

export const createFileRule: RuleCreator = (user, { can }) => {
  can(Action.Read, File);

  if ([ROLE.dev, ROLE.admin].includes(user.role)) {
    can(Action.Create, File);
  }

  if (ROLE.admin === user.role) {
    can(Action.Delete, File);
  }
};
