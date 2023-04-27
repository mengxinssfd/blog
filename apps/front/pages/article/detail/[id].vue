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

  <NuxtLayout name="page">
    <template #banner>
      <Banner :bg-img="article.cover || TODAY_COVER_URL" height="55vh" blur>
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
      <component
        :is="'script'"
        v-if="!mermaid"
        src="https://cdn.staticfile.org/mermaid/8.10.1/mermaid.min.js"></component>

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
          <ArticleDetailCommentBlock
            v-if="article.author"
            :article="article"></ArticleDetailCommentBlock>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import 'highlight.js/styles/atom-one-dark.css';
// import DomPurify from 'dompurify';
import * as xss from 'xss';
import '~/styles/vuepress.css';
import { View } from '@element-plus/icons-vue';
import { getArticleDetail } from '@blog/apis';
import { ArticleEntity } from '@blog/entities';
import { useAsyncData, useRoute } from '#app';
import { useArticle } from '~/feature/hooks';
import { TODAY_COVER_URL } from '~/config/constants';
// definePageMeta({
//   layout: false,
// });

const route = useRoute();
const articleId: number = route.params.id as any;
const Art = useArticle();
const textSize = ref(0);
const mermaid = process.client ? (window as any).mermaid : undefined;
const { article, like, audioVisible } = Art.Data;
const { onCommentLockUpdate, setLike, formatDate } = Art.Methods;

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
  const _article = data.value!.data;
  _article.content = xss.filterXSS(_article.content, {
    onTag(tag, html) {
      // tag是当前的标签名称，比如<a>标签，则tag的值是'a'
      // html是该标签的HTML，比如<a>标签，则html的值是'<a>'
      // options是一些附加的信息，具体如下：
      //   isWhite    boolean类型，表示该标签是否在白名单上
      //   isClosing  boolean类型，表示该标签是否为闭合标签，比如</a>时为true
      //   position        integer类型，表示当前标签在输出的结果中的起始位置
      //   sourcePosition  integer类型，表示当前标签在原HTML中的起始位置
      // 如果返回一个字符串，则当前标签将被替换为该字符串
      // 如果不返回任何值，则使用默认的处理方法：
      //   在白名单上：  通过onTagAttr来过滤属性，详见下文
      //   不在白名单上：通过onIgnoreTag指定，详见下文

      if (['input'].includes(tag)) return html;
    },
    onTagAttr(_tag, name, value) {
      // tag是当前的标签名称，比如<a>标签，则tag的值是'a'
      // name是当前属性的名称，比如href="#"，则name的值是'href'
      // value是当前属性的值，比如href="#"，则value的值是'#'
      // isWhiteAttr是否为白名单上的属性
      // 如果返回一个字符串，则当前属性值将被替换为该字符串
      // 如果不返回任何值，则使用默认的处理方法
      //   在白名单上：  调用safeAttrValue来过滤属性值，并输出该属性，详见下文
      //   不在白名单上：通过onIgnoreTagAttr指定，详见下文

      if (['id', 'class', 'align', 'style'].includes(name)) return `${name}="${value}"`;
    },
  });
  article.value = _article;
}
const init = () => {
  // _Methods.refreshData();
  Art.setArticleId(articleId);
  Art._Methods.getLikeCountData();

  if (process.client) {
    Art._Methods.resolveArticleRender();
    textSize.value = (Art.Data.articleRef.value?.innerText || '').replace(/[\n ]+/g, '').length;
  }
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
  pre code ul {
    list-style: none;
    counter-reset: index;
    padding: 0;
    li {
      display: table-row;
      div {
        margin-left: 5px;
      }
      &:before {
        display: table-cell;
        padding: 0 5px;
        text-align: right;
        border-right: 1px solid #858585;
        counter-increment: index; // 自增1
        content: counter(index);
      }
    }
  }
  .c-banner {
    .el-skeleton {
      padding: 0 2rem;
    }
  }
  .pg-content {
    flex: 1;
    position: relative;
    width: 100%;
    audio {
      position: fixed;
      right: 0;
      top: 77px;
      height: 40px;
    }
    section {
      padding: 1rem;
      @media (max-width: 750px) {
        padding: 1rem 0;
      }
      &.article {
        position: relative;
        img {
          cursor: zoom-in;
        }
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
          code {
            padding: 0;
          }
          .lang-type,
          .btn.copy-code {
            padding: 10px;
            font-size: 12px;
            line-height: 1em;
            color: gray;
          }
          .btn.copy-code {
            &:hover {
              color: white;
            }
          }
        }
      }
    }
  }
}
.img-zoom-wrapper {
  cursor: zoom-out;
  img {
    cursor: move;
  }
}
</style>
