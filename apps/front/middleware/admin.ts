import useUserStore from '~/store/user.store';
import { ROLE } from '@blog/entities';

export default defineNuxtRouteMiddleware(async () => {
  const userStore = useUserStore();
  const user = await userStore.useUser();
  if (user.role !== ROLE.superAdmin)
    return navigateTo({ path: '/404' }, { replace: true, redirectCode: 301 });
});
