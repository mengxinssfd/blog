<template>
  <footer class="c-footer">
    <div class="f-content main-width _ flex-col-c-c">
      <div class="record">
        Copyright © {{ year }} <a href="https://www.miitbeian.gov.cn/">{{ CASE_NUMBER }}</a>
      </div>
      <div class="time">
        ~~ 博客已平稳运行 <strong>{{ date }}</strong> 天 ~~
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { getTimePeriodConst } from '@tool-pack/basic';

const CASE_NUMBER = import.meta.env.VITE_CASE_NUMBER;
const START_AT = import.meta.env.VITE_SITE_START_AT;

const today = new Date();
const year = today.getFullYear();

const startAt = new Date(START_AT);

const date = ~~((today.getTime() - startAt.getTime()) / getTimePeriodConst().day);
</script>
<style lang="scss">
.c-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: var(--footer-height);
  color: var(--text-color);
  background-color: var(--navbar-bg-color);
  backdrop-filter: saturate(5) blur(3px);
  font-size: 13px;
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
