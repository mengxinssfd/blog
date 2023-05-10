<script setup lang="ts">
import * as Vue from 'vue';
import type { UserEntity } from '@blog/entities';

const props = defineProps({
  user: { type: Object as Vue.PropType<UserEntity>, default: () => {} },
  disabled: { type: Boolean, default: false },
});

const link = computed(() => '/user/info/' + props.user.id);
</script>

<template>
  <nuxt-link :disabled="disabled" :to="link" class="c-avatar">
    <el-avatar :src="user.avatar" size="large"></el-avatar>
  </nuxt-link>
</template>

<style lang="scss" scoped>
.c-avatar {
  position: relative;
  display: inline-block;
  width: 110px;
  height: 110px;
  background: url('https://gd-hbimg.huaban.com/dab5816cc966ba8c8d1b78b30853c34c170c6e36143eb-yOrYsm_fw1200webp')
    no-repeat center;
  background-size: cover;
  .el-avatar {
    position: absolute;
    top: 29px;
    left: 29px;
  }

  &[disabled='true'] {
    cursor: default;
  }
  &:not([disabled='true']):hover {
    filter: drop-shadow(1px 1px 10px var(--text-color));
  }
}
</style>
