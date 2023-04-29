<script setup lang="ts">
import useMenuStore from '~/store/menu.store';

const menuStore = useMenuStore();
</script>
<template>
  <Drawer
    v-model="menuStore.sideMenuVisible"
    direction="ltr"
    class="c-aside-menu"
    size="80%"
    :z-index="9">
    <ul>
      <template v-for="item in menuStore.menu" :key="item.path">
        <li
          v-if="!item.disabled"
          :class="{ active: menuStore.isActive(item.path) }"
          @click="menuStore.sideMenuVisible = false">
          <NuxtLink :to="item.path">
            <i class="iconfont" :class="item.icon"></i>
            {{ item.title }}
          </NuxtLink>
        </li>
      </template>
    </ul>
  </Drawer>
</template>

<style lang="scss">
.c-aside-menu {
  .el-drawer__body {
    padding: var(--header-height) 0 1rem;
    li {
      > a {
        display: block;
        padding: 1rem;
        color: inherit;
        > .iconfont {
          margin-right: 6px;
        }
      }
      &.active {
        color: var(--theme-color);
      }
      &:hover {
        color: var(--theme-color);
        background: var(--link-hover-bg-color);
      }
    }
  }
}
</style>
