<template>
  <div class="pg admin">
    <Title>Nice's Blog - 管理</Title>
    <!--    <Banner
      height="50vh"
      bg-img="https://pic3.zhimg.com/v2-0d085c719b2049343822acc207aa2f01_1200x500.jpg"
      :blur="false"
    ></Banner>-->
    <ClientOnly>
      <div class="admin-content board">
        <el-tabs v-model="tabs.activeName" @tab-click="handleClick">
          <el-tab-pane
            v-for="item in tabs.list"
            :key="item.name"
            :label="item.label"
            :name="item.name"></el-tab-pane>
        </el-tabs>
        <NuxtPage />
      </div>
    </ClientOnly>
  </div>
</template>

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
    },
    {
      label: '统计',
      name: 'statistics',
    },
    {
      label: '友链',
      name: 'friend-link',
    },
  ],
  activeName: /\/admin\/([^/]+)/.exec(route.path)?.[1] ?? 'account',
});

async function handleClick() {
  await nextTick();
  // router.replace({ path: '/admin/' + Data.tabs.activeName });
  navigateTo({ path: '/admin/' + tabs.activeName, replace: true });
}
</script>
<style lang="scss">
.pg.admin {
}
</style>
