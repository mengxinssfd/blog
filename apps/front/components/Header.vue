<template>
  <header class="c-header" :class="{ 'on-top': scrollTop === 0, [mode]: true }">
    <div class="effective-area _ flex-c-between main-width">
      <div class="left _ flex-c">
        <div v-for="nav in HeadNavRoutes" :key="nav.path">
          <NuxtLink :to="nav.path">
            <el-button size="small" :disabled="isActive(nav.path)">{{ nav.title }}</el-button>
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
        <template v-if="false">
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
        </template>
      </div>
    </div>
  </header>
</template>

<script lang="ts">
import { Search } from '@element-plus/icons-vue';
import { useRoute, useRouter } from '#app';
import { Token } from '~/feature/request/primary/token';
import useUserStore from '~/store/user.store';
import useHeaderStore from '~/store/header.store';

export default defineComponent({
  compatConfig: {
    INSTANCE_ATTRS_CLASS_STYLE: true,
  },
  components: { Search },
  setup() {
    const route = useRoute();
    const headerStore = useHeaderStore();
    const router = useRouter();
    const store = useUserStore();
    // 未通过router-view的组件在刷新页面时route获取不到query值，必须watch等它刷新过后才能拿到
    /* console.log('qqqqqqqqqqqqqqq', location.search, router.currentRoute.value);
    watch(route, () => {
      const query = route.query.query as string;
      query && (searchValue.value = query);
    }); */

    const _Methods = {
      getScrollTop() {
        Data.scrollTop.value = document.documentElement.scrollTop || document.body.scrollTop;
      },
    };
    const Data = {
      searchValue: ref((route.query.query as string) || ''),
      scrollTop: ref(0),
    };
    const Computed = {
      mode: computed(() => headerStore.mode),
      currentPath: computed(() => route.path),
      user: computed(() => store.user),
      loginPageUrl: computed(() => '/user/login?fromUrl=' + encodeURIComponent(route.fullPath)),
    };
    const Methods = {
      isActive(path: string) {
        if (path === '/') return path === route.path;
        return new RegExp(`^${path}`).test(route.path);
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
      // Methods.setThemeClass();
      _Methods.getScrollTop();
      // _Methods.loadTheme();
      addEventListener('scroll', () => {
        _Methods.getScrollTop();
      });
    }

    onMounted(init);
    return {
      ...headerStore.$state,
      ...Data,
      ...Computed,
      ...Methods,
    };
  },
});
</script>
<style lang="scss">
.c-header {
  height: 60px;
  + * {
    margin-top: 60px;
  }
  background: var(--navbar-bg-color);
  backdrop-filter: saturate(5) blur(20px);
  font-size: 14px;
  color: var(--text-color);
  transition: background 0.5s ease-in-out, height 0.5s ease-in-out;
  .el-button {
    background: none !important;
    border: 0 !important;
    color: var(--text-color);
    box-shadow: none;
    &.is-disabled {
      color: var(--theme-color);
      pointer-events: none;
    }
    &:hover {
      color: var(--theme-color);
    }
  }
  &.on-top {
    //height: 68px;
    //background: rgba(0, 0, 0, 0.05);
    //box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12);
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
        backdrop-filter: unset;
        .el-input__wrapper {
          color: inherit;
          background: none;
          border: 0;
          backdrop-filter: none;
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
