<script setup lang="ts">
const route = useRoute();
const disabled = computed(() => ['/user/login', '/user/register'].includes(route.path));
</script>
<template>
  <aside v-show="!disabled" class="c-toolbar">
    <AsideDrawerSwitcher />
    <ThemeSwitcher />
    <BackTop />
  </aside>
</template>

<style lang="scss" scoped>
.c-toolbar {
  position: fixed;
  right: 1.5rem;
  bottom: 8vh;
  z-index: 8;
  .btn {
    width: 2.2rem;
    height: 2.2rem;
    background: var(--toolbar-btn-bg-color);
    border-radius: var(--board-radius);
    box-shadow: 0 0 10px -4px #4280f3;
    + .btn {
      margin-top: 10px;
    }
  }
  .back-top {
    i {
      display: inline-block;
      padding: 10px;
    }
  }
}
</style>
