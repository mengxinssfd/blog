<template>
  <Lantern style="left: 10px" line-height="120px" content="春" />
  <Lantern style="left: 150px" left content="节" />
  <Lantern style="right: 150px" content="快" />
  <Lantern style="right: 10px" line-height="120px" content="乐" />
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
