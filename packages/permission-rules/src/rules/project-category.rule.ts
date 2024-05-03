import { ProjectCategoryEntity } from '@blog/entities';
import { Action, type RuleCreator } from '../types';

const Category = [ProjectCategoryEntity, ProjectCategoryEntity.modelName];

export const createProjectCategoryRule: RuleCreator = (_user, { can }) => {
  // 所有人都可查看
  can(Action.Read, Category);
};
