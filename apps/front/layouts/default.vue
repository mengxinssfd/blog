<template>
  <Firework />
  <Header />
  <div class="page-wrapper _ flex-col">
    <slot></slot>
    <Footer />
  </div>
  <Toolbar />
  <AsideMenu />
</template>

<script setup lang="ts"></script>
<style lang="scss"></style>
