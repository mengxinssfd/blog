<template>
  <div v-if="item.link" class="c-link-card _ flex-col">
    <el-image
      class="screenshot"
      :src="item.screenshot"
      :preview-src-list="[item.screenshot]"
      preview-teleported></el-image>
    <a class="link-info" :href="item.link" target="_blank" rel="noopener noreferrer">
      <div class="avatar-wrapper">
        <el-avatar :src="item.avatar" :size="24" shape="circle"></el-avatar>
      </div>
      <div class="name _ flex-c">
        <div class="_ flex-1 ellipsis-1">{{ item.name }}</div>
        <!--          <el-icon size="16"><ArrowRight></ArrowRight></el-icon>-->
      </div>
      <div class="desc _ ellipsis-4" :title="item.desc">{{ item.desc || '暂无描述' }}</div>
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
  color: var(--text-color);
  --radius: calc(var(--board-radius) * 1);
  border-radius: var(--radius);
  background: var(--mask-bg-color);
  .screenshot {
    //margin-bottom: 10px;
    border-radius: var(--radius) var(--radius) 0 0;
  }
  .el-image {
    position: relative;
    min-height: 100px;
    filter: brightness(0.95) saturate(1);
    transition: filter 0.3s;
    img {
      transition: transform 0.3s;
      transform-origin: center center;
      background: none;
    }
  }
  .link-info {
    position: relative;
    z-index: 1;
    padding: 1rem;
    color: inherit;
    border-radius: 0 0 var(--radius) var(--radius);
    .avatar-wrapper {
      float: right;
      margin: -60px -1rem 0 0;
      width: 32px;
      height: 32px;
      padding: 4px;
      background: var(--mask-bg-color);
      border-radius: 16px 0 0 16px;
      pointer-events: none;
    }
    &:hover {
      .name {
        color: var(--theme-color);
      }
    }
  }
  .name {
    font-weight: bold;
    font-size: 16px;
  }
  .desc {
    margin-top: 10px;
    font-size: 12px;
    min-height: 68px;
    color: var(--sec-text-color);
  }
  &:hover {
    .el-image {
      filter: brightness(1) saturate(1.75);
      img {
        //transform: scale(2);
      }
    }
  }
}
</style>
