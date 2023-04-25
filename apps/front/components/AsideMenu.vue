<script setup lang="ts">
import useMenuStore from '~/store/menu.store';

const menuStore = useMenuStore();

watch(
  () => menuStore.sideMenuVisible,
  (n) => {
    console.log(n);
  },
  { immediate: true },
);
</script>
<template>
  <el-drawer
    v-model="menuStore.sideMenuVisible"
    :with-header="false"
    :z-index="9"
    direction="ltr"
    class="c-aside-menu"
    size="80%">
    <ul>
      <template v-for="item in menuStore.menu" :key="item.path">
        <li
          v-if="!item.disabled"
          :class="{ active: menuStore.isActive(item.path) }"
          @click="menuStore.sideMenuVisible = false">
          <NuxtLink :to="item.path">
            {{ item.title }}
          </NuxtLink>
        </li>
      </template>
    </ul>
  </el-drawer>
</template>

<style lang="scss">
.c-aside-menu {
  .el-drawer__body {
    padding-top: var(--header-height);
    li {
      > a {
        display: block;
        padding: 1rem 10px;
        color: inherit;
      }
      &.active {
        color: var(--theme-color);
        pointer-events: none;
      }
      &:hover {
        color: var(--theme-color);
        background: var(--link-hover-bg-color);
      }
    }
  }
}
</style>
