<template>
  <footer class="c-footer">
    <div class="f-content main-width _ flex-col-c-c">
      <div class="record">
        Copyright © {{ year }} <a href="https://www.miitbeian.gov.cn/">{{ CASE_NUMBER }}</a>
      </div>
      <!--      <div class="power-by">powered by Typescript & Vue3 & Element-plus & Node.js & NestJS</div>-->
    </div>
  </footer>
</template>

<script setup lang="ts">
const CASE_NUMBER = import.meta.env.VITE_CASE_NUMBER;
const year = new Date().getFullYear();
</script>
<style lang="scss">
.c-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100px;
  color: var(--sec-text-color);
  .f-content {
    height: 100%;
    .power-by {
      margin-top: 10px;
    }
    .record a:not(:hover) {
      color: var(--sec-text-color);
    }
  }
}
</style>
