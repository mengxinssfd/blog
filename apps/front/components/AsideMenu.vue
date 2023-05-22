<script setup lang="tsx">
import { getClassNames } from '@tool-pack/basic';
import useMenuStore, { MenuItem } from '~/store/menu.store';

const menuStore = useMenuStore();

const Item = (props: { item: MenuItem }) => {
  const { item } = props;
  if (item.children && item.children.length) {
    return (
      <>
        {item.children.map((item) => (
          <Item item={item} />
        ))}
      </>
    );
  }
  return (
    <>
      {!item.disabled && (
        <li
          class={getClassNames({ active: menuStore.isActive(item.path) })}
          onClick={() => menuStore.toggleSideMenuVisible()}>
          <nuxt-link to={item.path}>
            <el-icon size="1em">{item.icon}</el-icon>
            <span>{item.title}</span>
          </nuxt-link>
        </li>
      )}
    </>
  );
};
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
        <Item :item="item" />
      </template>
    </ul>
  </Drawer>
</template>

<style lang="scss">
.c-aside-menu {
  .el-drawer__body {
    padding: var(--header-height) 0 1rem;
    font-family: system-ui;
    li {
      > a {
        display: flex;
        align-items: center;
        padding: 1rem;
        color: inherit;
        > .el-icon {
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
