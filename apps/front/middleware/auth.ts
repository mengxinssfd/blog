import useUserStore from '~/store/user.store';

export default defineNuxtRouteMiddleware(async (to) => {
  const userStore = useUserStore();
  const user = await userStore.useUser();
  if (!user.id) {
    return navigateTo(
      { path: '/user/login', query: { fromUrl: to.path } },
      { replace: true, redirectCode: 301 },
    );
  }
});
