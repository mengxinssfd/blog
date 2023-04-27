import { defineStore } from 'pinia';
import useUserStore from '~/store/user.store';
import { ROLE } from '@blog/entities';
import { useToggleState } from '~/feature/hooks';

const useMenuStore = defineStore('menu', () => {
  const route = useRoute();
  const userStore = useUserStore();
  const menu = computed<Array<{ icon: string; path: string; title: string; disabled?: boolean }>>(
    () => {
      return [
        { path: '/', title: `首页`, icon: 'icon-index' },
        { path: '/friend-link', title: `友链`, icon: 'icon-link' },
        { path: '/about', title: `关于`, icon: 'icon-user' },
        {
          path: '/admin',
          title: '后台',
          icon: 'icon-admin',
          disabled: userStore.user.role !== ROLE.superAdmin,
        },
      ];
    },
  );
  const [sideMenuVisible, toggleSideMenuVisible] = useToggleState(false);

  return {
    menu,
    sideMenuVisible,
    toggleSideMenuVisible,
    isActive(path: string) {
      if (path === '/') return path === route.path;
      return new RegExp(`^${path}`).test(route.path);
    },
  };
});

export default useMenuStore;
