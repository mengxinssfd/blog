import { SaysEntity } from '@blog/entities';
import { Action, RuleCreator } from '../types';

const Says = [SaysEntity, SaysEntity.modelName];

export const createSaysRule: RuleCreator = (_user, { can }) => {
  can([Action.Read], Says);
};
