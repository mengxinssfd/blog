<script setup lang="ts">
import * as Vue from 'vue';
import type { ElMenu } from 'element-plus';
import { throttle } from '@tool-pack/basic';
import { AnchorTree } from '~/components/article/detail/tree';

const tree = ref<AnchorTree[]>([]);
const menuRef = ref<typeof ElMenu>();
const treeMap = ref(new Map<string, AnchorTree>());
const elRef = ref<HTMLElement>();
const headings = ref<HTMLHeadingElement[]>([]);
const route = useRoute();
const router = useRouter();

const props = defineProps({
  reference: {
    type: [Object, String] as Vue.PropType<HTMLElement | string>,
    default: '.article .markdown-body',
  },
});

watch(
  () => props.reference,
  (n) => n && nextTick().then(parseTree),
);

function getHeads() {
  if (!props.reference) return [];

  const reference =
    typeof props.reference === 'string' ? document.querySelector(props.reference) : props.reference;

  const anchors = reference?.querySelectorAll<HTMLHeadingElement>('h1,h2,h3,h4,h5,h6') || [];
  return Array.from(anchors).filter((title) => !!title.innerText.trim());
}
function getTree(heads: HTMLHeadingElement[]): AnchorTree[] {
  const tree: AnchorTree[] = [];

  function setNode(curNode: AnchorTree, comNode: AnchorTree) {
    if (curNode.tagName > comNode.tagName) {
      // curNode.index = `${comNode.index}-${comNode.children.length + 1}`;
      comNode.children.push(curNode);
      curNode.parent = comNode;
      return;
    }
    if (curNode.tagName === comNode.tagName) {
      if (comNode.parent) {
        // curNode.index = `${comNode.parent.index}-${comNode.parent.children.length + 1}`;
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
      // index: String(index + 1),
      index: el.id,
      active: false,
    };
    treeMap.value.set(t.id, t);
    if (!prev) {
      tree.push(t);
      prev = t;
      return;
    }
    setNode(t, prev);
    prev = t;
  });
  return tree;
}
function parseTree(): void {
  treeMap.value.clear();
  const heads = getHeads();

  if (!heads.length) {
    tree.value = [];
    return;
  }
  headings.value = heads;

  tree.value = getTree(heads);
}
const scrollHandler = throttle(
  () => {
    const headingList = headings.value;
    if (!headingList.length) return;
    // const el = document.querySelector('.article article') as HTMLElement;
    const hlLen = headingList.length;
    headingList.forEach((item) => (treeMap.value.get(item.id)!.active = false));
    const index = headingList.findIndex((item, index) => {
      if (index === hlLen - 1) return true;
      const rect = item.getBoundingClientRect();
      // 如果是在top在屏幕内，或者比较高的内容
      return rect.top > 0;
    });
    if (index === -1) return;
    // const innerText = find.innerText.replace(/#+\s?/, '');
    let item = treeMap.value.get(headingList[index].id);
    if (!item) return;
    item.active = true;
    if (!item.children.length && !item.parent) return;
    if (!item.children.length) item = item.parent!;
    menuRef.value?.open(item.index);
  },
  300,
  { leading: true, trailing: true },
);

onMounted(() => {
  watch(
    route,
    () => {
      parseTree();
    },
    { immediate: true },
  );
  window.addEventListener('scroll', scrollHandler);
});
onBeforeUnmount(() => {
  window.removeEventListener('scroll', scrollHandler);
});

function onSelect(id: string) {
  // document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  router.push({ path: route.path, hash: '#' + id });
}
</script>
<template>
  <Widget>
    <template #title><h5>目录</h5></template>
    <div ref="elRef" class="widget-content">
      <el-menu ref="menuRef" default-active="1" unique-opened @select="onSelect">
        <ArticleDetailNode v-for="item in tree" :key="item.index" :tree="item" />
      </el-menu>
    </div>
  </Widget>
</template>

<style lang="scss" scoped>
.widget-content {
  max-height: 60vh;
  overflow: auto;
  --el-menu-item-height: 2.3rem;
  --el-menu-sub-item-height: 2.3rem;
  .el-menu {
    border-right: 0 !important;
  }
}
</style>
