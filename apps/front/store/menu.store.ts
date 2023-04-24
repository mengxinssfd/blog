import { defineStore } from 'pinia';
import useUserStore from '~/store/user.store';
import { ROLE } from '@blog/entities';

const useMenuStore = defineStore('menu', () => {
  const route = useRoute();
  const userStore = useUserStore();
  const menu = computed<Array<{ path: string; title: string; disabled?: boolean }>>(() => {
    return [
      { path: '/', title: `首页` },
      { path: '/friend-link', title: `友链` },
      { path: '/about', title: `关于` },
      { path: '/admin', title: '后台', disabled: userStore.user.role !== ROLE.superAdmin },
    ];
  });

  return {
    menu,
    isActive(path: string) {
      if (path === '/') return path === route.path;
      return new RegExp(`^${path}`).test(route.path);
    },
  };
});

export default useMenuStore;
