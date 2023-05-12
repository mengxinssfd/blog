<script setup lang="ts">
import { useArticle } from '~/feature/hooks';

const Art = useArticle();
const { article } = Art.Data;
const { getLikeCountData } = Art.Methods;

const init = () => {
  const article = Art.Data.article.value;
  if (!article) return;
  Art.setArticleId(article.id);
  getLikeCountData();
};

onMounted(init);
</script>

<template>
  <ArticleAsPage as="about" @data="article = $event">
    <template #aside>
      <WidgetStickyLayout>
        <ClientOnly>
          <WidgetArticleTOC v-if="article.id" />
        </ClientOnly>
        <WidgetRecentArticle />
      </WidgetStickyLayout>
    </template>
    <div class="board">
      <section class="article">
        <article v-if="!article.id">
          <el-skeleton :rows="10" animated />
        </article>
        <MdViewer v-else :content="article.content" />
      </section>
    </div>
  </ArticleAsPage>
</template>

<style lang="scss"></style>
