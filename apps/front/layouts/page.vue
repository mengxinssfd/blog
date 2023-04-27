<template>
  <div class="page-layout">
    <slot name="banner"></slot>
    <div class="main-wrapper _ flex main-width">
      <main class="_ flex-1">
        <slot />
      </main>
      <Aside><slot name="aside"></slot></Aside>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
<style lang="scss" scoped>
@import '@/styles/scss.variable.scss';

.page-layout {
  main {
    overflow-x: hidden;
  }
  :deep(.c-aside) {
    @media (max-width: $show-aside-on-screen-width) {
      display: none;
    }
  }
}
</style>
