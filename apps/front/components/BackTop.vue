<template>
  <div class="_ btn back-top" :class="{ hide: scrollTop < 100 }" @click="backTop()">
    <i class="iconfont icon-back-top shake-slow"></i>
  </div>
</template>

<script setup lang="ts">
import { useWindowScroll } from '~/feature/hooks';

const { scrollTop, backTop } = useWindowScroll();
</script>
<style lang="scss" scoped>
.btn.back-top {
  //margin-right: -30px;

  transition: all 0.3s;
  i {
    display: inline-block;
    padding: 10px;
  }
  &.hide {
    transform: translateY(100%);
    opacity: 0;
    pointer-events: none;
  }
}
</style>
