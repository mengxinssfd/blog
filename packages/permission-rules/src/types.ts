import { UserEntity } from '@blog/entities';
import { AbilityBuilder, MongoAbility } from '@casl/ability';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type RuleCreator = (
  user: UserEntity,
  builder: AbilityBuilder<MongoAbility<[Action, any]>>,
) => void;
