<template>
  <div v-if="item.link" class="c-project-card _ flex-col">
    <div class="cover-block">
      <el-image class="cover" :src="item.cover" />
      <div class="time">
        <i class="iconfont icon-update-at"></i>
        {{ formatTime(item.startTime) }} 至 {{ formatTime(item.endTime) }}
      </div>
      <div class="status" :class="ProjectStatus[item.status].toLowerCase()">
        {{ StatusTextMatches[item.status] }}
      </div>
    </div>
    <a class="link-info" :href="item.link" target="_blank" rel="noopener noreferrer">
      <div class="name _ flex-c">
        <div class="_ flex-1 ellipsis-1">{{ item.name }}</div>
      </div>
      <div class="tech-stack _ ellipsis-2"># {{ item.techStack }}</div>
      <div class="desc _ ellipsis-4" :title="item.desc">{{ item.desc || '暂无描述' }}</div>
      <!--      <div v-if="item.transferredTo" class="transferred-to">已转移至：{{ item.transferredTo }}</div>-->
    </a>
  </div>
</template>

<script setup lang="ts">
import * as Vue from 'vue';
import type { ProjectEntity } from '@blog/entities';
import { formatDate } from '@tool-pack/basic';
import { ProjectStatus } from '@blog/entities';

defineProps({
  item: {
    type: Object as Vue.PropType<ProjectEntity>,
    required: true,
  },
});

const StatusTextMatches: Record<ProjectStatus, string> = {
  [ProjectStatus.Developing]: '开发中',
  [ProjectStatus.Completed]: '已完成',
  [ProjectStatus.Transferred]: '已转移',
};

const formatTime = (v: Date | null) => {
  if (!v) return '--';
  return formatDate(new Date(v), 'yy-MM-dd');
};
</script>
<style lang="scss">
.c-project-card {
  color: var(--text-color);
  --radius: calc(var(--board-radius) * 1);
  border-radius: var(--radius);
  background: var(--mask-bg-color);

  .cover-block {
    position: relative;
    padding-bottom: 55%;
    height: 0;
    font-size: 0;
    .status,
    .time {
      position: absolute;
    }
    .status {
      right: 0;
      top: 0;
      color: white;
      padding: 0.2em 0.8em;
      font-size: 10px;
      border-radius: 0 var(--radius) 0 var(--radius);
      &.completed {
        background-color: #1ec81e;
      }
      &.developing {
        background-color: var(--theme-color);
      }
      &.transferred {
        background-color: #dc181a;
      }
    }
    .time {
      left: 0;
      bottom: 0;
      right: 0;
      padding: 0.2em 0.4em;
      font-size: 12px;
      color: white;
      background: linear-gradient(0deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0));
      i {
        font-size: inherit;
      }
    }
  }
  .cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    bottom: 0;
    min-height: 100px;
    filter: brightness(0.95) saturate(1);
    transition: filter 0.3s;
    //margin-bottom: 10px;
    border-radius: var(--radius) var(--radius) 0 0;

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

  .desc,
  .tech-stack,
  .transferred-to {
    font-size: 12px;
    color: var(--sec-text-color);
  }

  .desc {
    margin-top: 10px;
    min-height: 68px;
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
