<script setup lang="ts">
import * as Vue from 'vue';
import { sleep } from '@tool-pack/basic';
import { getCommentByArticle as getCommentByArticleApi } from '@blog/apis';
import { type ArticleEntity } from '@blog/entities';
import { RefreshRight } from '@element-plus/icons-vue';
import { useRequest } from '@request-template/vue3-hooks';
import { type CommentTreeType, handleCommentTree } from '~/feature/utils';

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

const list = computed<CommentTreeType[]>(() => {
  const _list = data.value?.list as CommentTreeType[];
  if (!_list || !_list.length) return [];
  return handleCommentTree(_list);
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
