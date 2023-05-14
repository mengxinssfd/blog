import { ProjectEntity } from '@blog/entities';
import { Action, RuleCreator } from '../types';

const Project = [ProjectEntity, ProjectEntity.modelName];

export const createProjectRule: RuleCreator = (_user, { can }) => {
  can(Action.Read, Project);
};
