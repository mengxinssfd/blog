<script setup lang="ts">
import { getRecentComment } from '@blog/apis';
import { useRequest } from '@request-template/vue3-hooks';
import { type CommentEntity } from '@blog/entities';
import { getArticleCommentLink } from '@blog/shared';
// table of content
const router = useRouter();
const route = useRoute();
const { data, loading, request } = useRequest(
  getRecentComment,
  { loading: { immediate: true, threshold: 500 } },
  [],
);

interface InnerComment extends CommentEntity {
  link: string;
  active: boolean;
}
const list = computed(() => {
  const path = route.path;
  return data.value.map((item) => {
    const link = getArticleCommentLink(item);
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
      <template v-if="loading">
        <el-skeleton v-for="i in list.length || 5" :key="i" animated>
          <template #template>
            <div class="_ flex">
              <el-skeleton-item
                variant="image"
                style="margin-right: 6px; width: 32px; height: 32px; border-radius: 50%" />
              <div class="_ flex-1 flex-col">
                <el-skeleton-item style="width: 100px" />
                <el-skeleton-item style="margin-top: 1.2rem" />
              </div>
            </div>
          </template>
        </el-skeleton>
      </template>
      <template v-else>
        <CommentBase
          v-for="item in list"
          :key="item.id"
          :item="item"
          :class="{ active: item.active }"
          independent
          @click-content="toArticle(item)" />
      </template>
    </div>
  </Widget>
</template>

<style lang="scss" scoped>
.widget-content {
  :deep(.el-skeleton) {
    + .el-skeleton {
      margin-top: 1.2rem;
    }
  }
}
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
