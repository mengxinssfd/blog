<script setup lang="ts">
import { useArticle } from '~/feature/hooks';

const Art = useArticle();
const { article, audioVisible } = Art.Data;
const { onCommentLockUpdate, getLikeCountData } = Art.Methods;

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
      <template v-if="article?.author">
        <WidgetArticleOperator :article="article" @comment-lock-updated="onCommentLockUpdate" />
      </template>
      <WidgetStickyLayout>
        <WidgetArticleTOC v-if="article.id" />
        <WidgetRecentArticle />
      </WidgetStickyLayout>
    </template>
    <audio
      v-if="article.bgm && audioVisible"
      controls
      :src="article.bgm"
      autoplay
      loop
      @error="audioVisible = false"></audio>
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
