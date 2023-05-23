<script setup lang="ts">
import { type ArticleEntity } from '@blog/entities';
import { getSaysList } from '@blog/apis';
import useUserStore from '~/store/user.store';
import { handleCommentTree } from '~/feature/utils';

const userStore = useUserStore();
const article = ref<ArticleEntity>({} as ArticleEntity);
const dialogVisible = ref(false);

const { data, refresh } = useAsyncData(() => getSaysList());

await refresh();

const says = computed(() => {
  const list = data.value?.data.list || [];
  if (!list.length) return [];
  return handleCommentTree(list);
});

const onData = (data: ArticleEntity) => {
  article.value = data;
};
</script>

<template>
  <ArticleAsPage
    :layout="userStore.isSuperAdmin ? 'page' : 'fixed-banner'"
    as="says"
    :banner-height="userStore.isSuperAdmin ? '55vh' : '100vh'"
    :comment-block-visible="false"
    @data="onData">
    <template #banner-content><span v-if="!userStore.isSuperAdmin"></span></template>
    <template #aside>
      <Widget title="添加">
        <div class="widget-content">
          <div class="widget-create-btn" @click="dialogVisible = true"></div>
        </div>
      </Widget>
    </template>
    <section class="says-list-area">
      <SaysCard
        v-for="item in says"
        :key="item.id"
        :item="item"
        :author-id="article.author.id"
        @update="refresh" />
      <el-empty v-if="!says.length" description="暂无数据" />
    </section>
  </ArticleAsPage>
  <SaysCreator v-model="dialogVisible" @created="refresh" />
</template>

<style lang="scss" scoped>
.says-list {
  text-align: center;
  .c-says-card {
    display: inline-block;
    min-width: 65vw;
    text-align: center;
    width: auto;
  }
  @media (max-width: 750px) {
    .c-says-card {
      display: block;
      text-align: left;
    }
  }
}
</style>
