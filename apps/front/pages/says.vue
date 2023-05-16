<script setup lang="ts">
import { type ArticleEntity } from '@blog/entities';
import { useRequest } from '@request-template/vue3-hooks';
import { getCommentByArticle } from '@blog/apis';
import useUserStore from '~/store/user.store';

const route = useRoute();
const userStore = useUserStore();
const article = ref<ArticleEntity>({} as ArticleEntity);
const dialogVisible = ref(false);

const { data, request } = useRequest(() => getCommentByArticle(article.value.id), {
  loading: { threshold: 500, immediate: true },
});

const says = computed(() => data.value?.list || []);

const onData = (data: ArticleEntity) => {
  article.value = data;
  request().then(() => {
    route.hash &&
      document.querySelector(route.hash)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
};
</script>

<template>
  <ArticleAsPage
    layout="fixed-banner"
    as="says"
    banner-height="100vh"
    :comment-block-visible="userStore.isSuperAdmin"
    @data="onData">
    <template #banner-content><span></span></template>
    <section class="says-list-area">
      <ul class="says-list">
        <li v-for="say in says" :key="say.id">
          <SaysCard :item="say" />
        </li>
      </ul>
      <el-empty v-if="!says.length" description="暂无数据" />
    </section>
  </ArticleAsPage>
  <ProjectFormDialog v-model:show="dialogVisible" />
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
