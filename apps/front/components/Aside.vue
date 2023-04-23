<script setup lang="ts"></script>
<template>
  <aside class="c-aside">
    <slot>
      <WidgetLoginUser />
      <WidgetCountdown />
      <WidgetRecentComments></WidgetRecentComments>
    </slot>
  </aside>
</template>

<style lang="scss">
.c-aside {
  margin-top: 1rem;
  flex-basis: 300px;
  width: 300px;
  padding-left: 1rem;
  transition: transform 0.5s ease-in-out;
}
</style>
