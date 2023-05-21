<template>
  <header
    class="c-header"
    :class="{ 'on-top': headerStore.isOnTop, [`mode-${headerStore.mode}`]: true }">
    <div class="effective-area _ flex-c-between main-width">
      <div class="left _ flex-c">
        <div class="btns _ flex-c">
          <template v-for="nav in menuStore.menu" :key="nav.path">
            <template v-if="!nav.children || !nav.children.length">
              <div v-if="!nav.disabled">
                <NuxtLink :to="nav.path">
                  <el-button :disabled="menuStore.isActive(nav.path)">{{ nav.title }}</el-button>
                </NuxtLink>
              </div>
            </template>
            <template v-else>
              <client-only>
                <el-dropdown>
                  <NuxtLink :to="nav.path">
                    <el-button :disabled="menuStore.isActive(nav.path)">{{ nav.title }}</el-button>
                  </NuxtLink>
                  <template #dropdown>
                    <el-dropdown-menu class="nav-dropdown-menu">
                      <template v-for="child in nav.children" :key="child.path">
                        <el-dropdown-item v-if="!child.disabled">
                          <NuxtLink :to="child.path">
                            {{ child.title }}
                          </NuxtLink>
                        </el-dropdown-item>
                      </template>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </client-only>
            </template>
          </template>
        </div>
        <MenuSwitcher v-model="menuStore.sideMenuVisible" />
      </div>
      <div class="right">
        <div class="search">
          <el-input
            v-model="searchValue"
            placeholder="搜索文章"
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
        <template v-if="route.path !== '/'">
          <template v-if="user.id">
            <client-only>
              <el-dropdown @command="onSelect">
                <div class="avatar img-box"><img :src="user.avatar" :alt="user.nickname" /></div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="/article/create">
                      <i class="iconfont icon-edit"></i>
                      写文章
                    </el-dropdown-item>
                    <el-dropdown-item :command="'/user/info/' + user.id">
                      <i class="iconfont icon-user"></i>
                      个人中心
                    </el-dropdown-item>
                    <el-dropdown-item command="logout">
                      <el-icon><SwitchButton /></el-icon>
                      登出</el-dropdown-item
                    >
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

<script setup lang="ts">
import { Search, SwitchButton } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
import useUserStore from '~/store/user.store';
import useMenuStore from '~/store/menu.store';
import useHeaderStore from '~/store/header.store';

const headerStore = useHeaderStore();
const route = useRoute();
const menuStore = useMenuStore();
const router = useRouter();
const userStore = useUserStore();
const searchValue = ref((route.query.query as string) || '');

const loginPageUrl = computed(() => '/user/login?fromUrl=' + encodeURIComponent(route.fullPath));
const currentPath = computed(() => route.path);
const user = computed(() => userStore.user);

// 未通过router-view的组件在刷新页面时route获取不到query值，必须watch等它刷新过后才能拿到
/* console.log('qqqqqqqqqqqqqqq', location.search, router.currentRoute.value);
watch(route, () => {
  const query = route.query.query as string;
  query && (searchValue.value = query);
}); */

const toSearch = () => {
  const query = { ...route.query, query: searchValue.value };
  router.push({ path: '/', query });
};

const onSelect = (command: string) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确认退出？', undefined, { type: 'warning' }).then(userStore.logout);
    return;
  }
  router.replace({ path: command });
};
</script>
<style lang="scss">
.nav-dropdown-menu {
  li {
    padding: 0;
    a {
      padding: 8px 10px;
      width: 100%;
    }
  }
}
.c-header {
  height: var(--header-height);
  + * {
    padding-top: 60px;
  }
  background-color: var(--navbar-bg-color);
  backdrop-filter: saturate(5) blur(20px);
  font-size: 14px;
  color: var(--text-color);
  transition: all 0.5s ease-in-out;
  .el-dropdown,
  a,
  .el-button {
    color: inherit;
  }
  .el-button {
    background: none !important;
    border: 0 !important;
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
  &.mode-transparent.on-top {
    --navbar-bg-color: rgba(0, 0, 0, 0);
    --text-color: white;
    backdrop-filter: none;
    box-shadow: 0 0 10px 1px rgba(0, 0, 0, 0.1);
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
  .c-aside-menu-switcher {
    visibility: hidden;
  }
  @media (max-width: 750px) {
    .c-aside-menu-switcher {
      visibility: visible;
    }
    .effective-area .left .btns {
      display: none;
    }
  }
}
</style>
