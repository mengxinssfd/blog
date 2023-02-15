import { RbacGuard } from './rbac.guard';
import { ROLE } from '@blog/entities';

describe('RbacGuard', () => {
  it('should be defined', () => {
    expect(new RbacGuard(ROLE.commonUser)).toBeDefined();
  });
});
