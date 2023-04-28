<script setup lang="ts">
const asideContent = useState('aside.hiddenContent');
const route = useRoute();
const disabled = computed(() => [/^\/admin/].some((item) => new RegExp(item).test(route.path)));
</script>
<template>
  <div
    :class="{ disabled }"
    class="aside-drawer-contents-switcher _ btn flex-c-c"
    @click="asideContent = !asideContent">
    <i class="iconfont icon-category"></i>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/scss.variable.scss';
.aside-drawer-contents-switcher {
  display: none;
}
@media (max-width: $show-aside-on-screen-width) {
  .aside-drawer-contents-switcher:not(.disabled) {
    display: flex;
  }
}
</style>
