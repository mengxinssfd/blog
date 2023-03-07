import { UserEntity } from '@blog/entities';
import { AbilityBuilder, AnyMongoAbility } from '@casl/ability';

export type RuleCreator = (user: UserEntity, builder: AbilityBuilder<AnyMongoAbility>) => void;

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}
