<template>
  <nav class="c-head-nav" :class="{ 'on-top': scrollTop === 0 }">
    <div class="effective-area _ flex-c-between main-width">
      <div class="left _ flex-c">
        <div v-for="nav in HeadNavRoutes" :key="nav.path">
          <NuxtLink :to="nav.path">
            <el-button size="small" :disabled="isActive(nav.path)">{{ getTitle(nav) }}</el-button>
          </NuxtLink>
        </div>
        <!--    后台    -->
        <div v-if="user.role === 0" class="admin">
          <NuxtLink to="/admin">
            <el-button size="small" :disabled="isActive('/admin')">
              <!--              <i class="iconfont icon-admin"></i>-->
              后台
            </el-button>
          </NuxtLink>
        </div>
      </div>
      <div class="right">
        <client-only>
          <el-popover placement="bottom" :width="200" trigger="hover">
            <template #reference>
              <i class="_ btn iconfont theme-switcher" :class="'icon-' + themeIcon"></i>
            </template>
            <el-radio-group v-model="theme" size="small" @change="onThemeChange">
              <el-radio-button :label="ThemeTypes.light"></el-radio-button>
              <el-radio-button :label="ThemeTypes.dark"></el-radio-button>
              <el-radio-button :label="ThemeTypes.auto"></el-radio-button>
            </el-radio-group>
          </el-popover>
        </client-only>

        <div class="search">
          <el-input
            v-model="searchValue"
            placeholder="搜索内容"
            size="small"
            clearable
            @keydown.enter="toSearch"
            @clear="toSearch">
            <template #append>
              <el-button @click="toSearch">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>
        <div v-if="currentPath !== '/article/create'" class="write">
          <NuxtLink to="/article/create">
            <el-button size="small"><i class="iconfont icon-edit"></i></el-button>
          </NuxtLink>
        </div>
        <template v-if="user.id">
          <client-only>
            <el-dropdown>
              <div class="avatar img-box"><img :src="user.avatar" :alt="user.nickname" /></div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="toUserInfoPage">个人中心</el-dropdown-item>
                  <el-dropdown-item @click="logout">登出</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </client-only>
          <!--          <div class="nickname">{{ user.nickname }}</div>-->
        </template>
        <div v-else-if="currentPath !== '/user/login'" class="login">
          <NuxtLink :to="loginPageUrl">
            <el-button size="small">登录</el-button>
          </NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { getMilliseconds, inRange } from '@tool-pack/basic';
import { Search } from '@element-plus/icons-vue';
import { useRoute, useRouter } from '#app';
import { Token } from '~/feature/request/primary/token';
import useUserStore from '~/store/user';

const PROJECT_NAME = '我的博客';

interface NavItem {
  path: string;
  title: string;
}
export const HeadNavRoutes: Array<NavItem> = [
  {
    path: '/',
    title: `${PROJECT_NAME} - 首页`,
  },
  {
    path: '/friend-link',
    title: `${PROJECT_NAME} - 友链`,
  },
  {
    path: '/about',
    title: `${PROJECT_NAME} - 关于`,
  },
];
export default defineComponent({
  compatConfig: {
    INSTANCE_ATTRS_CLASS_STYLE: true,
  },
  components: { Search },
  setup() {
    const route = useRoute();

    const router = useRouter();
    const store = useUserStore();
    // 未通过router-view的组件在刷新页面时route获取不到query值，必须watch等它刷新过后才能拿到
    /* console.log('qqqqqqqqqqqqqqq', location.search, router.currentRoute.value);
    watch(route, () => {
      const query = route.query.query as string;
      query && (searchValue.value = query);
    }); */
    enum ThemeTypes {
      light = 'light',
      dark = 'dark',
      auto = 'auto',
    }

    const _Methods = {
      getScrollTop() {
        Data.scrollTop.value = document.documentElement.scrollTop || document.body.scrollTop;
      },
      loadTheme() {
        const theme = (localStorage.getItem('theme') as ThemeTypes) || ThemeTypes.auto;
        if (theme === Data.theme.value) return;
        Data.theme.value = theme;
        Methods.setThemeClass();
      },
    };
    const Data = {
      HeadNavRoutes,
      ThemeTypes,
      searchValue: ref((route.query.query as string) || ''),
      scrollTop: ref(0),
      theme: ref<ThemeTypes>(ThemeTypes.auto),
    };
    const Computed = {
      currentPath: computed(() => route.path),
      themeIcon: computed(() => {
        const obj: Record<ThemeTypes, string> = {
          [ThemeTypes.light]: 'sun',
          [ThemeTypes.dark]: 'moon',
          [ThemeTypes.auto]: 'auto',
        };
        return obj[Data.theme.value];
      }),
      user: computed(() => store.user),
      loginPageUrl: computed(() => '/user/login?fromUrl=' + encodeURIComponent(route.fullPath)),
    };
    let timer: number;
    const Methods = {
      isActive(path: string) {
        if (path === '/') {
          return path === route.path;
        }
        return new RegExp(`^${path}`).test(route.path);
      },
      getTitle(nav: NavItem) {
        return nav.title.split(' - ')[1];
      },
      onThemeChange() {
        Methods.setTheme();
      },
      setThemeClass() {
        const classList = document.documentElement.classList;

        const obj: Record<ThemeTypes, Function> = {
          [ThemeTypes.light]() {
            classList.remove('theme-dark');
            classList.add('theme-light');
          },
          [ThemeTypes.dark]() {
            classList.remove('theme-light');
            classList.add('theme-dark');
          },
          [ThemeTypes.auto]() {
            const hour = new Date().getHours();
            // timer = window.setTimeout(obj[Data.theme.value], 1000 * 60 * 30);
            timer = window.setTimeout(obj[Data.theme.value], getMilliseconds({ hours: 0.5 }));
            if (inRange(hour, [6, 17])) {
              obj[ThemeTypes.light]();
              return;
            }
            obj[ThemeTypes.dark]();
          },
        };

        clearTimeout(timer);
        obj[Data.theme.value]();
      },
      setTheme() {
        localStorage.setItem('theme', Data.theme.value);
        Methods.setThemeClass();
      },
      toSearch() {
        const query = { ...route.query, query: Data.searchValue.value };
        router.push({ path: '/', query });
      },
      toUserInfoPage() {
        router.push({ path: '/user/info/' + Computed.user.value.id });
      },
      logout() {
        Token.clear();
        location.reload();
      },
    };

    function init() {
      Methods.setThemeClass();
      _Methods.getScrollTop();
      _Methods.loadTheme();
      addEventListener('scroll', () => {
        _Methods.getScrollTop();
      });
    }

    onMounted(init);
    return {
      ...Data,
      ...Computed,
      ...Methods,
    };
  },
});
</script>
<style lang="scss">
.c-head-nav {
  height: 60px;
  background: var(--navbar-bg-color);
  font-size: 14px;
  color: var(--navbar-text-color);
  transition: background 0.5s ease-in-out, height 0.5s ease-in-out;
  .el-button {
    background: none !important;
    border: 0 !important;
    color: var(--navbar-text-color);
    box-shadow: none;
    &.is-disabled {
      color: var(--link-hover-color);
      pointer-events: none;
    }
    &:hover {
      color: var(--link-hover-color);
    }
  }
  &.on-top {
    height: 68px;
    background: rgba(0, 0, 0, 0.05);
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12);
  }
  .effective-area {
    padding: 0 10px;
    height: 100%;
    > div {
      display: flex;
      align-items: center;
      > div + div {
        margin-left: 20px;
      }
    }
    .left {
      i {
        font-size: 1em;
        margin-right: 4px;
      }
    }
    .theme-switcher {
      margin-right: 10px;
    }
    .avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      overflow: hidden;
      img {
        display: block;
        width: 100%;
        height: 100%;
      }
    }
    .search {
      .el-input {
        background: none;
        --el-input-text-color: var(--navbar-text-color);
        border: 0;
        .el-input__wrapper {
          color: inherit;
          background: none;
          border: 0;
          box-shadow: none;
        }
      }
      .el-input-group__append {
        background: none;
        border: 0;
        box-shadow: none;
      }
    }
  }
}
</style>
