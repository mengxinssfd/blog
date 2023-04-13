<template>
  <div class="pg about _ flex-col">
    <Title>Nice's Blog - 关于我</Title>
    <Banner :bg-img="article.cover" :blur="false" height="50vh"></Banner>
    <div class="pg-content main-width board">
      <audio
        v-if="article.bgm && audioVisible"
        controls
        :src="article.bgm"
        autoplay
        loop
        @error="audioVisible = false"></audio>
      <ArticleDetailAuthorBlock
        v-if="user.role === ROLE.superAdmin && article.author"
        :article="article"
        @comment-lock-updated="onCommentLockUpdate"></ArticleDetailAuthorBlock>
      <section class="article">
        <article ref="articleRef" class="vuepress-markdown-body" v-html="article.content"></article>
      </section>
      <ArticleDetailCommentBlock
        v-if="article.author"
        :article="article"></ArticleDetailCommentBlock>
    </div>
  </div>
</template>

<script lang="ts">
import 'highlight.js/styles/atom-one-dark.css';
import { getAbout } from '@blog/apis';
import type { ArticleEntity } from '@blog/entities';
import { useAsyncData } from '#app';
import { useArticle } from '~/feature/hooks';

export default defineComponent({
  async setup() {
    const Art = useArticle();
    const Data = {
      ...Art.Data,
    };
    const _Methods = {
      ...Art._Methods,
      async getData() {
        const { data } = await useAsyncData(() => getAbout(), {
          default: () => ({ data: {} as ArticleEntity }),
        });
        Data.article.value = data.value!.data;
      },
    };
    const Methods = {
      ...Art.Methods,
    };
    const init = () => {
      Art._Methods.resolveArticleRender();
      const article = Art.Data.article.value;
      if (!article) return;
      Art.setArticleId(article.id);
      _Methods.getLikeCountData();
    };

    onMounted(init);

    await _Methods.getData();

    return {
      ...Data,
      ...Methods,
    };
  },
});
</script>
<style lang="scss">
.pg.about {
  margin: 0 !important;
  .pg-content {
    flex: 1;
    position: relative;
    padding: 1rem 0;
    audio {
      position: fixed;
      right: 0;
      top: 77px;
      height: 40px;
    }
    section {
      padding: 1rem 2rem;
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
