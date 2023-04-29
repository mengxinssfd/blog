<script setup lang="ts">
import 'highlight.js/styles/atom-one-dark.css';
import { getArticleAs } from '@blog/apis';
import type { ArticleEntity, UserEntity } from '@blog/entities';
import { useAsyncData } from '#app';
import { useArticle } from '~/feature/hooks';
import useHeaderStore from '~/store/header.store';

useHeaderStore().useTransparent();

const Art = useArticle();
const { article, audioVisible } = Art.Data;
const { getLikeCountData } = Art._Methods;
const { onCommentLockUpdate } = Art.Methods;

async function getData() {
  const { data } = await useAsyncData(() => getArticleAs('about'), {
    default: () => ({ data: {} as ArticleEntity }),
  });
  article.value = data.value!.data;
  article.value.author = { id: 1 } as UserEntity;
}
const init = () => {
  Art._Methods.resolveArticleRender();
  const article = Art.Data.article.value;
  if (!article) return;
  Art.setArticleId(article.id);
  getLikeCountData();
};

onMounted(init);

await getData();
</script>

<template>
  <Title>Nice's Blog - 关于我</Title>
  <NuxtLayout name="page">
    <template #banner>
      <Banner
        :bg-img="article.cover"
        :blur="false"
        :brightness="0.7"
        height="55vh"
        content="关于我"></Banner>
    </template>
    <template #aside>
      <template v-if="article.author">
        <WidgetArticleOperator :article="article" @comment-lock-updated="onCommentLockUpdate" />
      </template>
      <WidgetRecentArticle />
      <WidgetArticleTOC v-if="article.id" v-sticky="'76px'" />
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
            <article
              v-else
              ref="articleRef"
              class="vuepress-markdown-body"
              v-html="article.content"></article>
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
      padding: 1rem;
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
        .vuepress-markdown-body:not(.custom) {
          padding: 0;
        }
        .vuepress-markdown-body {
          color: var(--post-text-color);
          //background: var(--board-bg-color);
          background: none;
        }
        pre {
          position: relative;
          .btn.copy-code {
            padding: 10px;
            font-size: 12px;
            line-height: 1em;
            color: gray;
            &:hover {
              color: white;
            }
          }
        }
      }
    }
  }
}
</style>
