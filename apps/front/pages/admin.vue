<script setup lang="ts">
import { ROLE } from '@blog/entities';

definePageMeta({
  // middleware: ['admin'],
  redirect: '/admin/account',
  redirectBase: '/admin',
  role: ROLE.superAdmin,
  pageTransition: false,
});

const route = useRoute();
const tabs = reactive({
  list: [
    {
      label: '账号',
      name: 'account',
      icon: 'icon-user',
    },
    {
      label: '统计',
      name: 'statistics',
      icon: 'icon-huifu',
    },
    {
      label: '友链',
      name: 'friend-link',
      icon: 'icon-link',
    },
    {
      label: '文件',
      name: 'file',
      icon: 'icon-tag',
    },
  ],
  activeName: /\/admin\/([^/]+)/.exec(route.path)?.[1] ?? 'account',
});
const isCollapse = ref(true);

function handleClick(name: string) {
  // router.replace({ path: '/admin/' + Data.tabs.activeName });
  navigateTo({ path: '/admin/' + name, replace: true });
}
</script>

<template>
  <Title>Nice's Blog - 管理</Title>
  <div class="pg admin">
    <div class="board _ flex">
      <el-menu
        class="menu"
        :default-active="tabs.activeName"
        :collapse="isCollapse"
        unique-opened
        @select="handleClick">
        <el-menu-item v-for="item in tabs.list" :key="item.name" :index="item.name">
          <el-icon><i class="iconfont" :class="item.icon"></i></el-icon>
          <span>{{ item.label }}</span>
        </el-menu-item>
      </el-menu>
      <div class="page _ flex-1">
        <MenuSwitcher :model-value="!isCollapse" @update:model-value="isCollapse = !$event" />
        <NuxtPage />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pg.admin {
  overflow: hidden;
  .page {
    overflow: auto;
    padding: 1rem;
  }
  .menu {
    .iconfont {
      margin-right: 6px;
    }
    &:not(.el-menu--collapse) {
      width: 180px;
    }
  }
  > .board {
    position: absolute;
    top: var(--header-height);
    bottom: var(--footer-height);
    left: 0;
    right: 0;
    margin: 0;
    padding: 0;
  }
}
</style>
