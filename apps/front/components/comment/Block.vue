<script setup lang="ts">
import * as Vue from 'vue';
import { forEachRight, sleep } from '@tool-pack/basic';
import { getCommentByArticle as getCommentByArticleApi } from '@blog/apis';
import { type ArticleEntity } from '@blog/entities';
import { RefreshRight } from '@element-plus/icons-vue';
import { useRequest } from '@request-template/vue3-hooks';
import { getRegionLocation } from '@blog/shared';
import type { TupleM2N } from '@tool-pack/types';
import type { CommentTreeType } from './tree.d';

const route = useRoute();
const props = defineProps({
  article: {
    required: true,
    type: Object as Vue.PropType<ArticleEntity>,
  },
});

const { data, loading, request } = useRequest(() => getCommentByArticleApi(props.article.id), {
  loading: { threshold: 500, immediate: true },
});

const osMatches = {
  Android: '安卓',
  Windows: 'win',
};

function filterOs(os: string | null): string {
  if (!os) return '';
  const split = os.split(/[|\s]/) as TupleM2N<string, 2, 3>;

  const platform = split[0];

  const tuple = [osMatches[platform as keyof typeof osMatches] || platform, split.at(-1)];

  return [...new Set(tuple)].join(' ');
}

const browserMatches = {
  'Microsoft Edge': 'Edge',
};

function filterBrowser(browser: string | null): string {
  if (!browser) return '';
  const split = browser.split(/[|\s]/) as [string, string];

  const platform = split[0];

  const tuple = [
    browserMatches[platform as keyof typeof browserMatches] || platform,
    split.at(-1)!.split('.')[0],
  ];

  return [...new Set(tuple)].join(' ');
}

const list = computed<CommentTreeType[]>(() => {
  const _list = data.value?.list as CommentTreeType[];
  if (!_list || !_list.length) return [];

  // 组装成二级树结构
  const finalList: CommentTreeType[] = [];
  const idMap: Record<string, CommentTreeType> = {};
  const children = _list.filter((item) => {
    idMap[item.id] = item;

    item.region = getRegionLocation(item.region);
    item.os = filterOs(item.os);
    item.browser = filterBrowser(item.browser);

    item.children = [];
    if (!item.parentId) {
      finalList.push(item);
      return false;
    }
    return true;
  });

  const orphans: any[] = [];
  forEachRight(children, (child: CommentTreeType) => {
    const parent = idMap[child.parentId || ''] || idMap[child.replyId || ''];
    if (!parent) {
      child.isOrphan = true;
      orphans.push(child);
      return;
    }
    if (!parent.children) parent.children = [];
    parent.children.push(child);
    child.parent = parent;
    if (child.replyId && child.parentId !== child.replyId) {
      child.reply = idMap[child.replyId];
    }
  });

  finalList.push(...orphans.reverse());

  return finalList;
});

const scrollToAnchor = async () => {
  const anchor = route.hash;
  if (!anchor || !/_comment-\d+/.test(anchor)) return;
  await sleep(500);
  document.querySelector(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

watch(data, (n) => {
  if (!n) return;
  scrollToAnchor();
});

onBeforeMount(request);
</script>

<template>
  <div class="c-comment-block main-width">
    <h2>评论</h2>
    <CommentInputBox :article-id="article.id" @created="request" />
    <div class="total _ flex-c">
      <span>全部评论({{ data?.count }})</span>
      <Space width="6px" />
      <el-icon class="_ btn" :class="{ disabled: loading }" @click="request">
        <RefreshRight />
      </el-icon>
    </div>
    <div class="list">
      <template v-if="loading">
        <el-skeleton v-for="i in data?.count || 2" :key="i" animated>
          <template #template>
            <div class="_ flex">
              <el-skeleton-item
                variant="image"
                style="margin-right: 6px; width: 32px; height: 32px; border-radius: 50%" />
              <div class="_ flex-1 flex-col">
                <el-skeleton-item style="width: 20%" />
                <el-skeleton-item style="margin-top: 10px" />
                <el-skeleton-item style="margin-top: 10px" />
                <el-skeleton-item style="margin-top: 10px; width: 30%" />
              </div>
            </div>
          </template>
        </el-skeleton>
      </template>
      <template v-else>
        <CommentTree
          v-for="item in list"
          :key="item.id"
          :item="item"
          :author-id="article.author.id"
          @update="request"></CommentTree>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.c-comment-block {
  h2 {
    margin-bottom: 1rem;
    font-size: 20px;
    font-weight: bold;
  }
  .total {
    margin: 1rem 0;
  }
  .comm-right {
    :deep(textarea) {
      background: var(--input-bg-color);
    }
  }
  .list {
    :deep(.el-skeleton) {
      margin: 2rem 0;
    }
  }
}
</style>
