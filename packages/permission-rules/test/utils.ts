import { USER_ROLE, UserEntity } from '@blog/entities';

export function getRoles() {
  const superAdmin = new UserEntity();
  superAdmin.role = USER_ROLE.superAdmin;
  superAdmin.id = 1;
  superAdmin.nickname = 'super admin';

  const commonUser1 = new UserEntity();
  commonUser1.role = USER_ROLE.commonUser;
  commonUser1.id = 2;
  commonUser1.nickname = 'common user 1';

  const commonUser2 = new UserEntity();
  commonUser2.role = USER_ROLE.commonUser;
  commonUser2.id = 3;
  commonUser2.nickname = 'common user 2';

  const dev = new UserEntity();
  dev.role = USER_ROLE.dev;
  dev.id = 4;

  const admin = new UserEntity();
  admin.role = USER_ROLE.admin;
  admin.id = 5;

  return { superAdmin, admin, dev, commonUser1, commonUser2 };
}
