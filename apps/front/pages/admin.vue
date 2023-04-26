<script setup lang="ts">
import { ROLE } from '@blog/entities';
import { navigateTo, useRoute } from '#app';
import { definePageMeta } from '#imports';

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

function handleClick(name: string) {
  // router.replace({ path: '/admin/' + Data.tabs.activeName });
  navigateTo({ path: '/admin/' + name, replace: true });
}
</script>

<template>
  <Title>Nice's Blog - 管理</Title>
  <div class="pg admin">
    <div class="board _ flex">
      <el-menu class="menu" :default-active="tabs.activeName" unique-opened @select="handleClick">
        <el-menu-item v-for="item in tabs.list" :key="item.name" :index="item.name">
          <i class="iconfont" :class="item.icon"></i> {{ item.label }}
        </el-menu-item>
      </el-menu>
      <div class="page _ flex-1">
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
    width: 200px;
    .iconfont {
      margin-right: 6px;
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
