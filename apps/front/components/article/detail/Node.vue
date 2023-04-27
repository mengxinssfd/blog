<template>
  <el-sub-menu v-if="tree.children.length" :index="tree.index">
    <template #title>
      <div class="slot _ ellipsis-1" :class="{ active: tree.active }">{{ tree.label }}</div>
    </template>

    <ArticleDetailNode
      v-for="item in tree.children"
      :key="item.index"
      :tree="item"></ArticleDetailNode>
  </el-sub-menu>
  <el-menu-item v-else :index="tree.index">
    <div class="slot" :class="{ active: tree.active }">{{ tree.label }}</div>
  </el-menu-item>
</template>

<script lang="ts">
import * as Vue from 'vue';
import type { AnchorTree } from './tree';

export default defineComponent({
  name: 'Node',
  props: {
    tree: {
      type: Object as Vue.PropType<AnchorTree>,
      required: true,
    },
  },
});
</script>
<style scoped lang="scss">
.slot {
  width: 100%;
  transition: color 0.2s;
  --el-menu-sub-item-height: 2.3rem;
  &:before {
    position: absolute;
    left: 0;
    top: 50%;
    width: 2px;
    height: 50%;
    transform: translateY(-50%);
    background-color: var(--board-bg-color);
    transition: background-color 0.2s;
    content: '';
  }
  &.active {
    color: var(--el-menu-active-color);
    &:before {
      background-color: currentColor;
    }
  }
}
</style>
