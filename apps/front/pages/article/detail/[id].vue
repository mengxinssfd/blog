<template>
  <Title>Nice's Blog - {{ article.title }}</Title>
  <Meta name="description" :content="article.description" />
  <Meta property="og:type" content="website" />
  <Meta property="og:title" :content="`Nice's Blog - ${article.title}`" />
  <Meta property="og:url" :content="`https://xiaojiju.com/article/datail/${articleId}`" />
  <Meta property="og:site_name" content="Nice's Blog" />
  <Meta property="og:description" :content="article.description" />
  <Meta property="og:locale" content="zh_CN" />
  <Meta property="og:image" :content="article.cover" />
  <Meta
    name="keyword"
    :content="`${article.category?.name},${article.tags?.map((t) => t.name).join(',')},${
      article.title
    }`" />

  <component
    :is="'script'"
    src="https://cdn.staticfile.org/mermaid/8.10.1/mermaid.min.js"></component>

  <NuxtLayout name="page">
    <template #banner>
      <Banner
        :bg-img="article.cover || TODAY_COVER_URL"
        height="55vh"
        :blur="false"
        :brightness="0.7">
        <template #content>
          <el-skeleton v-if="!article.id" class="main-width" :rows="5" animated />
          <div v-else class="cover-content">
            <h1 class="article-title">
              <span class="text">{{ article.title }}</span>
            </h1>
            <div class="article-info">
              <div class="time _ flex-c-c">
                <div class="create-at">
                  <i class="iconfont icon-create-at"></i>
                  发布于{{ formatDate(article.createAt.toString()) }}
                </div>
                <div class="update-at">
                  <i class="iconfont icon-update-at"></i>
                  更新于{{ formatDate(article.updateAt.toString()) }}
                </div>
              </div>
              <div class="row-2 _ flex-c-c">
                <div class="text-size _ flex-c-c">字数：{{ textSize }}</div>
                <div class="view-count _ flex-c">
                  <el-icon size="1em"><View /></el-icon><span>{{ article.viewCount }}</span>
                </div>
                <div class="like btn" @click="setLike">
                  <i class="iconfont" :class="like.checked ? 'icon-like2' : 'icon-like1'"></i>
                  <span>{{ like.count }}</span>
                </div>
                <div class="cate-tags">
                  <span class="cate">
                    <i class="iconfont icon-category"></i>
                    {{ article.category?.name }}
                  </span>
                  <span class="div-line"></span>
                  <i class="iconfont icon-tag"></i>
                  <span v-for="item in article.tags" :key="item.id" class="tag">
                    {{ item.name }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Banner>
    </template>
    <template #aside>
      <template v-if="article.author">
        <WidgetArticleAuthor :article="article" />
        <WidgetArticleOperator :article="article" @comment-lock-updated="onCommentLockUpdate" />
      </template>
      <WidgetRecentArticle />
      <WidgetArticleTOC v-if="article.id" v-sticky="'76px'" />
    </template>
    <div class="pg article-detail _ flex-col">
      <div class="pg-content main-width">
        <audio
          v-if="article.bgm && audioVisible"
          controls
          :src="article.bgm"
          autoplay
          loop
          @error="audioVisible = false"></audio>
        <div class="board article">
          <article v-if="!article.id">
            <el-skeleton :rows="10" animated />
          </article>
          <MdViewer
            v-else
            :content="article.content"
            @word-count-change="textSize = $event"></MdViewer>
        </div>
        <div class="board">
          <CommentBlock v-if="article.author" :article="article" />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
// import DomPurify from 'dompurify';
import { View } from '@element-plus/icons-vue';
import { getArticleDetail } from '@blog/apis';
import { ArticleEntity } from '@blog/entities';
import { useAsyncData, useRoute } from '#app';
import { useArticle } from '~/feature/hooks';
import { TODAY_COVER_URL } from '~/config/constants';
import useHeaderStore from '~/store/header.store';
// definePageMeta({
//   layout: false,
// });

useHeaderStore().useTransparent();
const route = useRoute();
const articleId: number = route.params.id as any;
const Art = useArticle();
const textSize = ref(0);
const { article, like, audioVisible } = Art.Data;
const { onCommentLockUpdate, setLike, formatDate, getLikeCountData } = Art.Methods;

async function getArticle() {
  const { data /*, refresh */ } = await useAsyncData(
    route.fullPath,
    () => getArticleDetail(articleId),
    {
      // to do 使用了initialCache，刷新页面时会在浏览器额外再请求一次
      // initialCache: false,
      default: () => ({ data: {} as ArticleEntity }),
    },
  );
  article.value = data.value!.data;
}
const init = () => {
  // _Methods.refreshData();
  Art.setArticleId(articleId);
  getLikeCountData();
};

if (process.client && !(window as any).__NUXT__.data[route.fullPath]) {
  onMounted(() => {
    getArticle().then(init);
  });
} else {
  onMounted(init);
  await getArticle();
}
</script>
<style lang="scss">
.cover-content {
  font-size: 13px;
  .article-title {
    font-size: 36px;
    @media (max-width: 750px) {
      font-size: 26px;
    }
  }
  .cate-tags {
    .div-line {
      margin: 0 10px;
      border-right: 1px solid #ccc;
    }
    .tag {
      margin-right: 10px;
    }
  }
  i {
    font-size: 1em;
    margin-right: 4px;
  }
  .time {
    margin-top: 10px;
    .update-at {
      margin-left: 10px;
    }
  }
  .article-info {
    @media (max-width: 750px) {
      > div {
        justify-content: flex-start;
      }
      .time {
        display: block;
        > div {
          margin-left: 0;
        }
      }
    }
  }
  .row-2 {
    margin-top: 10px;
    > div + div {
      margin-left: 10px;
    }
  }
}
.pg.article-detail {
  margin: 0 !important;
  .c-banner {
    .el-skeleton {
      padding: 0 2rem;
    }
  }
  .pg-content {
    flex: 1;
    position: relative;
    width: 100%;
    @media (max-width: 750px) {
      .board {
        --board-padding: 0.5rem;
      }
    }
    audio {
      position: fixed;
      right: 0;
      top: 77px;
      height: 40px;
    }
    .article {
      padding: 1rem;
      @media (max-width: 750px) {
        padding: 1rem 0;
      }
      position: relative;
    }
  }
}
</style>
