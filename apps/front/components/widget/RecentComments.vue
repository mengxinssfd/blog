<script setup lang="ts">
import { getRecentComment } from '@blog/apis';
import { useRequest } from '@request-template/vue3-hooks';
import { type CommentEntity } from '@blog/entities';
// table of content
const router = useRouter();
const route = useRoute();
const { data, request } = useRequest(getRecentComment, undefined, []);

interface InnerComment extends CommentEntity {
  link: string;
  active: boolean;
}
const list = computed(() => {
  const path = route.path;
  return data.value.map((item) => {
    const link = item.article.as ? `/${item.article.as}` : '/article/detail/' + item.articleId;
    return { ...item, link, active: path === link };
  }) as InnerComment[];
});

onMounted(request);

function toArticle(item: InnerComment) {
  if (item.active) return;
  router.push(item.link);
}
</script>
<template>
  <Widget>
    <template #title>
      <h5 class="widget-title">最新评论</h5>
    </template>
    <div class="widget-content">
      <CommentBase
        v-for="item in list"
        :key="item.id"
        :item="item"
        :class="{ active: item.active }"
        independent
        @click-content="toArticle(item)"></CommentBase>
    </div>
  </Widget>
</template>

<style lang="scss" scoped>
.c-comment {
  margin-bottom: 0.3rem;
  &:not(.active) {
    :deep(.content) {
      cursor: pointer;
      &:hover {
        color: var(--theme-color);
      }
    }
  }
}
</style>
