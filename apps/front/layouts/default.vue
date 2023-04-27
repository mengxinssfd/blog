<template>
  <Header />
  <div class="page-wrapper _ flex-col">
    <slot></slot>
    <Footer />
  </div>
  <Toolbar />
  <AsideMenu />
</template>

<script setup lang="ts">
import Toolbar from '~/components/Toolbar.vue';
</script>
<style lang="scss"></style>
