<script setup lang="ts">
import { ChromeFilled, LocationInformation, Platform } from '@element-plus/icons-vue';
import * as Vue from 'vue';
import { formatDate } from '@tool-pack/basic';
import { getRegionLocation } from '@blog/shared';
import { filterBrowser, filterOs } from '~/feature/utils';
import type { CommentTreeType } from '~/components/comment/tree.d';

const props = defineProps({
  item: {
    type: Object as Vue.PropType<CommentTreeType>,
    default: () => ({}),
  },
});

const route = useRoute();

const id = computed(() => `_says-${props.item.id}`);
const isActive = computed(() => route.hash === `#${id.value}`);

// const item = { os: 'windows', browser: 'chrome', region: '广东广州' };
</script>

<template>
  <div :id="id" class="c-says-card board" :class="{ active: isActive }">
    <div class="top">
      <div class="time">{{ formatDate(new Date(item.createAt)) }}</div>
    </div>
    <div class="content frosted-glass-bg">
      <MdViewer :content="item.content" is-md></MdViewer>
    </div>
    <div class="bottom _ flex-c">
      <!-- 位置 -->
      <div v-if="item.region && item.region !== '--'" class="location _ flex-c">
        <el-icon><LocationInformation /></el-icon>
        <span>{{ getRegionLocation(item.region) }}</span>
      </div>
      <div v-if="item.os" class="location _ flex-c">
        <el-icon><Platform /></el-icon>
        <span>{{ filterOs(item.os) }}</span>
      </div>
      <div v-if="item.browser" class="location _ flex-c">
        <el-icon><ChromeFilled /></el-icon>
        <span>{{ filterBrowser(item.browser) }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.c-says-card {
  position: relative;
  background-color: unset;
  color: white;
  .content {
    margin-bottom: 6px;
    padding: 1rem;
    article {
      padding: 0;
      color: inherit;
      text-align: left;
    }
  }
  .bottom {
    font-size: 12px;
    > div {
      margin-right: 10px;
    }
    i {
      margin-right: 2px;
    }
  }
  &.active {
    border: 1px solid var(--theme-color);
  }
}
</style>
