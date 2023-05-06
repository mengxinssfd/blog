<script setup lang="ts">
import { getArticleAs } from '@blog/apis';
import type { ArticleEntity, UserEntity } from '@blog/entities';
import { useArticle } from '~/feature/hooks';
import useHeaderStore from '~/store/header.store';

useHeaderStore().useTransparent();

const Art = useArticle();
const { article, audioVisible } = Art.Data;
const { onCommentLockUpdate, getLikeCountData } = Art.Methods;

async function getData() {
  const { data } = await useAsyncData(() => getArticleAs('about'), {
    default: () => ({ data: {} as ArticleEntity }),
  });
  article.value = data.value!.data;
  article.value.author = { id: 1 } as UserEntity;
}
const init = () => {
  const article = Art.Data.article.value;
  if (!article) return;
  Art.setArticleId(article.id);
  getLikeCountData();
};

onMounted(init);

await getData();
</script>

<template>
  <Title>Nice's Blog - {{ article.title }}</Title>
  <NuxtLayout name="page">
    <template #banner>
      <Banner
        :bg-img="article.cover"
        :blur="false"
        :brightness="0.7"
        height="55vh"
        :content="article.title"></Banner>
    </template>
    <template #aside>
      <template v-if="article.author">
        <WidgetArticleOperator :article="article" @comment-lock-updated="onCommentLockUpdate" />
      </template>
      <WidgetStickyLayout>
        <WidgetArticleTOC v-if="article.id" />
        <WidgetRecentArticle />
      </WidgetStickyLayout>
    </template>
    <div class="pg about _ flex-col">
      <div class="pg-content main-width">
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
        <div class="board">
          <CommentBlock v-if="article.author" :article="article" />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss">
.pg.about {
  margin: 0 !important;
  .pg-content {
    flex: 1;
    position: relative;
    audio {
      position: fixed;
      right: 0;
      top: 77px;
      height: 40px;
    }
    section {
      &.info {
        display: flex;
        align-items: center;
        .avatar {
          margin-right: 10px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          overflow: hidden;
        }
        .nickname {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-color);
        }
        .operate-block {
          margin-top: 10px;
          font-size: 14px;
          color: #909090;
          > div {
            margin-right: 10px;
          }
        }
      }
      &.article {
        position: relative;
      }
    }
  }
}
</style>
