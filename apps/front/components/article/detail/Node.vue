<template>
  <div
    class="c-anchor-node"
    :style="{ padding: `10px 0 10px ${tree.data.indent * 20}px` }"
    @click="handleAnchorClick(tree)">
    <a style="cursor: pointer">{{ tree.data.title }}</a>
    <ArticleDetailNode
      v-for="t in tree.children"
      :key="t.data.id"
      :tree="t"
      @anchorChange="handleAnchorClick(t)"></ArticleDetailNode>
  </div>
</template>

<script lang="ts">
import * as Vue from 'vue';
import type { AnchorTree } from './tree';

export default defineComponent({
  name: 'Node',
  components: {},
  props: {
    tree: {
      type: Object as Vue.PropType<AnchorTree>,
      required: true,
    },
  },
  emits: ['anchorChange'],
  setup(_, ctx) {
    const Data = {};
    const Methods = {
      handleAnchorClick(anchor: AnchorTree) {
        ctx.emit('anchorChange', anchor.data?.id);
      },
    };
    return { ...Data, ...Methods };
  },
});
</script>
<style lang="scss">
.c-anchor-node {
  a {
    color: var(--text-color);
  }
}
</style>
