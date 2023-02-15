import { RbacInterceptor } from './rbac.interceptor';
import { ROLE } from '@blog/entities';

describe('RbacInterceptor', () => {
  it('should be defined', () => {
    expect(new RbacInterceptor(ROLE.superAdmin)).toBeDefined();
  });
});
