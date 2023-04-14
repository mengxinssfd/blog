<template>
  <div v-if="item.link" class="c-link-card _ flex-col">
    <el-image
      class="screenshot"
      :src="item.screenshot"
      :preview-src-list="[item.screenshot]"
      preview-teleported></el-image>
    <a class="link-info _ flex" :href="item.link" target="_blank" rel="noopener noreferrer">
      <div class="left">
        <el-avatar :src="item.avatar" :size="32" shape="square"></el-avatar>
      </div>
      <div class="right _ flex-1">
        <div class="name _ flex-c">
          <div class="_ flex-1 ellipsis-1">{{ item.name }}</div>
          <el-icon size="16"><ArrowRight></ArrowRight></el-icon>
        </div>
        <div class="desc _ ellipsis-2" :title="item.desc">{{ item.desc || '暂无描述' }}</div>
      </div>
    </a>
  </div>
</template>

<script setup lang="ts">
import * as Vue from 'vue';
import type { FriendLinkEntity } from '@blog/entities';
import { ArrowRight } from '@element-plus/icons-vue';

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
  border-radius: 8px;
  color: var(--text-color);
  background: rgba(0, 0, 0, 0.02);
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
  .screenshot {
    margin-bottom: 10px;
    border-radius: 4px;
  }
  .link-info {
    color: inherit;
    &:hover {
      .name {
        color: #7da5ed;
      }
    }
  }
  .right {
    margin-left: 6px;
    overflow: hidden;
    .name {
      font-weight: bold;
      font-size: 16px;
    }
    .desc {
      margin-top: 10px;
      font-size: 12px;
      min-height: 33px;
    }
  }
}
</style>
