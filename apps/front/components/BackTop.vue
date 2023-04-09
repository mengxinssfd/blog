<template>
  <div class="c-back-top _ pos-trans-c main-width">
    <div class="_ btn abs-br back-top" :class="{ hide: scrollTop < 600 }" @click="backTop">
      <i class="iconfont icon-back-top shake-slow"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWindowScroll } from '~/feature/hooks';

const { scrollTop, backTop } = useWindowScroll();
</script>
<style lang="scss">
.c-back-top {
  position: fixed !important;
  z-index: 50;
  bottom: 60px;
  .btn.back-top {
    margin-right: -30px;
    background: var(--board-bg-color);
    color: var(--text-color);
    border-radius: 6px;
    box-shadow: 0 0 10px -4px #4280f3;
    transition: all 0.3s;
    &:hover {
      background: #f8f6f6;
    }
    i {
      display: inline-block;
      padding: 10px;
    }
    &.hide {
      transform: translateY(100%);
      opacity: 0;
      pointer-events: none;
    }
    @media (max-width: 576px) {
      margin-right: 20px;
    }
  }
}
</style>
