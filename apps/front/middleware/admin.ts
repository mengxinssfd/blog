import useUserStore from '~/store/user.store';
import { USER_ROLE } from '@blog/entities/constant';

export default defineNuxtRouteMiddleware(async () => {
  const userStore = useUserStore();
  const user = await userStore.useUser();
  if (user.role !== USER_ROLE.superAdmin)
    return navigateTo({ path: '/404' }, { replace: true, redirectCode: 301 });
});
