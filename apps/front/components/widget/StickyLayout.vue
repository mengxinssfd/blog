<template>
  <div class="widget-sticky-layout"><slot></slot></div>
</template>

<style lang="scss">
.widget-sticky-layout {
  position: sticky;
  top: calc(var(--header-height) + 1rem);
}
</style>
