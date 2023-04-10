<template>
  <div class="c-anchor _ flex-col">
    <template v-if="tree.length">
      <h1>目录</h1>
      <div class="node-wrapper">
        <!--      <ArticleDetailNode v-for="node in tree" :key="node.data.id" :tree="node" v-bind="$attrs" />-->
        <el-tree
          ref="treeRef"
          :data="tree"
          :props="defaultProps"
          node-key="id"
          accordion
          @node-click="handleAnchorClick" />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import type { AnchorTree } from './tree';

export default defineComponent({
  name: 'Anchor',
  emits: ['anchorChange'],
  setup(_, ctx) {
    const Data = {
      tree: ref<AnchorTree[]>([]),
      treeRef: ref(),
      defaultProps: {
        children: 'children',
        label: 'label',
      },
    };
    const Methods = {
      handleAnchorClick(anchor: AnchorTree) {
        ctx.emit('anchorChange', anchor.id);
      },
      getHeads(el: HTMLElement): HTMLHeadingElement[] {
        const anchors = el.querySelectorAll<HTMLHeadingElement>('h1,h2,h3,h4,h5,h6');
        return Array.from(anchors).filter((title) => !!title.innerText.trim());
      },
      getTree(heads: HTMLHeadingElement[]): AnchorTree[] {
        const tree: AnchorTree[] = [];

        function setNode(curNode: AnchorTree, comNode: AnchorTree) {
          if (curNode.tagName > comNode.tagName) {
            comNode.children.push(curNode);
            curNode.parent = comNode;
            return;
          }
          if (curNode.tagName === comNode.tagName) {
            if (comNode.parent) {
              comNode.parent.children.push(curNode);
              curNode.parent = comNode.parent;
            } else {
              tree.push(curNode);
            }
            return;
          }
          if (comNode.parent) {
            setNode(curNode, comNode.parent);
            return;
          }
          tree.push(curNode);
        }

        let prev: AnchorTree;
        heads.forEach((el) => {
          const t: AnchorTree = {
            id: el.id as string,
            tagName: el.tagName,
            children: [],
            label: el.innerText,
          };
          if (!prev) {
            tree.push(t);
            prev = t;
            return;
          }
          setNode(t, prev);
          prev = t;
        });
        return tree;
      },
      parseTree(el: HTMLElement): void {
        const heads = Methods.getHeads(el);

        if (!heads.length) {
          Data.tree.value = [];
          return;
        }

        Data.tree.value = Methods.getTree(heads);

        // nextTick(()=>{
        //   Data.treeRef.value.
        // })
      },
    };
    return { ...Data, ...Methods };
  },
});
</script>
<style lang="scss">
.c-anchor {
  position: sticky;
  top: 60px;
  margin-top: 10px;
  margin-left: 10px;
  font-size: 12px;
  max-height: calc(100vh - 60px);
  .el-tree {
    background: none;
  }
  .node-wrapper {
    flex: 1;
    overflow-y: auto;
    word-break: break-all;
  }
}
</style>
