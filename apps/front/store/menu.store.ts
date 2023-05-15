import { defineStore } from 'pinia';
import useUserStore from '~/store/user.store';
import { useToggleState } from '~/feature/hooks';

const useMenuStore = defineStore('menu', () => {
  const route = useRoute();
  const userStore = useUserStore();
  const menu = computed<Array<{ icon: string; path: string; title: string; disabled?: boolean }>>(
    () => {
      return [
        { path: '/', title: `首页`, icon: 'icon-index' },
        { path: '/friend-link', title: `友链`, icon: 'icon-link' },
        { path: '/project', title: `项目`, icon: 'icon-user', disabled: false },
        {
          path: '/tools/transform-img-type',
          title: `小工具`,
          icon: 'icon-moon',
          children: [
            {
              path: '/tools/transform-img-type',
              title: '图片格式转换工具',
              icon: 'icon-user',
              disabled: false,
            },
            {
              path: '/tools/memory',
              title: '记忆小助手',
              icon: 'icon-user',
              disabled: true,
            },
          ],
        },
        { path: '/about', title: `关于`, icon: 'icon-user' },
        {
          path: '/admin',
          title: '后台',
          icon: 'icon-admin',
          disabled: !userStore.isSuperAdmin,
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
