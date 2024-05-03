import { RbacInterceptor } from './rbac.interceptor';
import { USER_ROLE } from '@blog/entities';

describe('RbacInterceptor', () => {
  it('should be defined', () => {
    expect(new RbacInterceptor(USER_ROLE.superAdmin)).toBeDefined();
  });
});
