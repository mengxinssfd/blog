import { RbacGuard } from './rbac.guard';
import { USER_ROLE } from '@blog/entities';

describe('RbacGuard', () => {
  it('should be defined', () => {
    expect(new RbacGuard(USER_ROLE.commonUser)).toBeDefined();
  });
});
