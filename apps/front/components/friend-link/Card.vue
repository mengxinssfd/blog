<template>
  <div class="c-link-card">
    <a
      v-if="item.link"
      :href="item.link"
      target="_blank"
      rel="noopener noreferrer"
      class="_ flex-c">
      <div class="left">
        <el-avatar :src="item.avatar" :size="32"></el-avatar>
      </div>
      <div class="right">
        <div class="name">{{ item.name }}</div>
        <div class="desc">{{ item.desc || '暂无描述' }}</div>
      </div>
    </a>
  </div>
</template>

<script setup lang="ts">
import * as Vue from 'vue';
import type { FriendLinkEntity } from '@blog/entities';

defineProps({
  item: {
    type: Object as Vue.PropType<FriendLinkEntity>,
    required: true,
  },
});
</script>
<style lang="scss">
.c-link-card {
  padding: 10px;
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
  .right {
    margin-left: 12px;
    color: var(--text-color);
    .name {
      font-weight: bold;
      font-size: 16px;
    }
    .desc {
      margin-top: 10px;
      font-size: 12px;
    }
  }
}
</style>
