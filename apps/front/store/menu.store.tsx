import { defineStore } from 'pinia';
import useUserStore from '~/store/user.store';
import {
  Briefcase,
  VideoCameraFilled,
  Memo,
  Mic,
  PictureRounded,
  WindPower,
} from '@element-plus/icons-vue';
import type { VNode } from '#imports';

export interface MenuItem {
  icon: VNode;
  path: string;
  title: string;
  disabled?: boolean;
  children?: MenuItem[];
}

const useMenuStore = defineStore('menu', () => {
  const route = useRoute();
  const userStore = useUserStore();
  const menu = computed<MenuItem[]>(() => {
    return [
      { path: '/', title: `首页`, icon: <i class="iconfont icon-index" /> },
      { path: '/friend-link', title: `友链`, icon: <i class="iconfont icon-link" /> },
      { path: '/project', title: `项目`, icon: <Briefcase />, disabled: false },
      {
        path: '/says',
        title: '说说',
        icon: <Mic />,
      },
      {
        path: '/tools/transform-img-type',
        title: `小工具`,
        icon: <i class="iconfont icon-moon" />,
        children: [
          {
            path: '/tools/transform-img-type',
            title: '图片格式转换工具',
            icon: <PictureRounded />,
          },
          {
            path: '/tools/memory-helper',
            title: '记忆助手',
            icon: <Memo />,
            disabled: false,
          },
          {
            path: '/tools/record',
            title: '录屏工具',
            icon: <VideoCameraFilled />,
            disabled: false,
          },
        ],
      },
      { path: '/about', title: `关于`, icon: <WindPower /> },
      {
        path: '/admin',
        title: '后台',
        icon: <i class="iconfont icon-admin" />,
        disabled: !userStore.isSuperAdmin,
      },
    ] as MenuItem[];
  });
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
