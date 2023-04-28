<template>
  <div class="c-comment-block main-width">
    <h2>评论</h2>
    <CommentInputBox :article-id="article.id" @created="getComment" />
    <div class="total">全部评论({{ comment.count }})</div>
    <div v-if="article.author" class="list">
      <CommentTree
        v-for="item in comment.list"
        :key="item.id"
        :item="item"
        :author-id="article.author.id"
        @update="onCommentUpdate"></CommentTree>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as Vue from 'vue';
import { forEachRight } from '@tool-pack/basic';
import { getCommentByArticle as getCommentByArticleApi } from '@blog/apis';
import { type ArticleEntity } from '@blog/entities';
import type { CommentTreeType } from './tree.d';

const props = defineProps({
  article: {
    required: true,
    type: Object as Vue.PropType<ArticleEntity>,
  },
});

const comment = reactive({
  list: [] as CommentTreeType[],
  count: 0,
});

const getComment = async () => {
  const {
    data: { list = [], count = 0 },
  } = await getCommentByArticleApi(props.article.id);

  // 组装成二级树结构
  const finalList: any[] = [];
  const idMap: any = {};
  const children = list.filter((item: any) => {
    idMap[item.id] = item;
    item.children = [];
    if (!item.parentId) {
      finalList.push(item);
      return false;
    }
    return true;
  });

  const orphans: any[] = [];
  forEachRight(children, (child: any) => {
    const parent = idMap[child.parentId] || idMap[child.replyId];
    if (!parent) {
      child.isOrphan = true;
      orphans.push(child);
      return;
    }
    parent.children.push(child);
    child.parent = parent;
    if (child.parentId !== child.replyId) {
      child.reply = idMap[child.replyId];
    }
  });

  finalList.push(...orphans.reverse());

  comment.list = finalList;
  comment.count = count;
};
const onCommentUpdate = () => {
  getComment();
};

onMounted(getComment);
</script>
<style lang="scss" scoped>
.c-comment-block {
  h2 {
    margin-bottom: 1rem;
    font-size: 20px;
    font-weight: bold;
  }
  .total {
    margin-top: 1rem;
  }
  .comm-right {
    :deep(textarea) {
      background: var(--input-bg-color);
    }
  }
}
</style>
