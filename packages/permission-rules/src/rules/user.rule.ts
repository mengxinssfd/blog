import { USER_ROLE, UserEntity } from '@blog/entities';
import { Action, type RuleCreator } from '../types';

export const createUserRule: RuleCreator = (user, { can, cannot }) => {
  can(Action.Create, UserEntity);
  can(Action.Read, UserEntity);
  cannot(Action.Delete, UserEntity, { role: USER_ROLE.superAdmin }).because(
    '不能删除superAdmin的账号',
  );
  cannot(Action.Update, UserEntity, 'muted', { role: USER_ROLE.superAdmin }).because(
    '不能禁言superAdmin',
  );

  if (![USER_ROLE.superAdmin, USER_ROLE.admin].includes(user.role)) {
    can(Action.Update, UserEntity, { id: user.id }).because(
      '只有该用户或管理员才可以更新自己的信息',
    );
    cannot(Action.Update, UserEntity, { id: { $ne: user.id } }).because('禁止修改其他账号信息');
    cannot(Action.Update, UserEntity, 'password', { id: { $ne: user.id } }).because(
      '禁止修改其它账号的密码',
    );
    cannot(Action.Update, UserEntity, 'muted').because('管理员才可以修改用户是否禁言');

    cannot(Action.Read, UserEntity, ['mobile', 'password', 'email', 'salt', 'registerIp']).because(
      '只有该用户和管理员才可以获取用户的私密信息',
    );
    can(Action.Read, UserEntity, ['mobile', 'password', 'email'], { id: user.id }).because(
      '只有该用户和管理员才可以获取用户的部分私密信息',
    );
    cannot(Action.Update, UserEntity, 'role').because('只有superAdmin才能设置role');
  }
};
