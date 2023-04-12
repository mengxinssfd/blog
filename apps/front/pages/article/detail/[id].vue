<template>
  <div class="pg article-detail _ flex-col">
    <Title>Nice's Blog - {{ article.title }}</Title>
    <Meta name="description" :content="article.description" />

    <Meta property="og:type" content="website" />
    <Meta property="og:title" :content="`Nice's Blog - ${article.title}`" />
    <Meta property="og:url" :content="`https://xiaojiju.com/article/datail/${articleId}`" />
    <Meta property="og:site_name" content="Nice's Blog" />
    <Meta property="og:description" :content="article.description" />
    <Meta property="og:locale" content="zh_CN" />
    <Meta property="og:image" :content="article.cover" />

    <component
      :is="'script'"
      v-if="!mermaid"
      src="https://cdn.staticfile.org/mermaid/8.10.1/mermaid.min.js"></component>
    <Meta
      name="keyword"
      :content="`${article.category?.name},${article.tags?.map((t) => t.name).join(',')},${
        article.title
      }`" />
    <Banner :bg-img="article.cover || TODAY_COVER_URL" height="60vh">
      <template #content>
        <el-skeleton v-if="!article.id" class="main-width" :rows="5" animated />
        <div v-else class="cover-content">
          <h1 class="article-title">
            <span class="text">{{ article.title }}</span>
          </h1>
          <div class="text-size _ flex-c-c">字数：{{ textSize }}</div>
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
          <div class="time _ flex-c-c">
            <div class="create-at">
              <i class="iconfont icon-create-at"></i>{{ formatDate(article.createAt.toString()) }}
            </div>
            <div class="update-at">
              <i class="iconfont icon-update-at"></i>{{ formatDate(article.updateAt.toString()) }}
            </div>
          </div>
          <div class="view-like _ flex-c-c">
            <div class="view-count _ flex-c">
              <el-icon size="1em"><IconView /></el-icon><span>{{ article.viewCount }}</span>
            </div>
            <div class="like btn" @click="setLike">
              <i class="iconfont" :class="like.checked ? 'icon-like2' : 'icon-like1'"></i>
              <span>{{ like.count }}</span>
            </div>
          </div>
        </div>
      </template>
    </Banner>
    <div class="pg-content main-width board">
      <audio
        v-if="article.bgm && audioVisible"
        controls
        :src="article.bgm"
        autoplay
        loop
        @error="audioVisible = false"></audio>
      <ArticleDetailAuthorBlock
        v-if="article.author"
        :article="article"
        @comment-lock-updated="onCommentLockUpdate"></ArticleDetailAuthorBlock>
      <section class="article">
        <article v-if="!article.id">
          <el-skeleton :rows="10" animated />
        </article>
        <article
          v-else
          ref="articleRef"
          class="vuepress-markdown-body"
          v-html="article.content"></article>
        <aside>
          <ArticleDetailAnchor ref="anchorRef" @anchor-change="onClickAnchor"></ArticleDetailAnchor>
        </aside>
      </section>
      <ArticleDetailCommentBlock
        v-if="article.author"
        :article="article"></ArticleDetailCommentBlock>
    </div>
  </div>
</template>

<script lang="ts">
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

export default defineComponent({
  components: { IconView: View },
  async setup() {
    const route = useRoute();
    const articleId: number = route.params.id as any;
    const anchorRef = ref();
    const Art = useArticle();
    const Data = {
      ...Art.Data,
      anchorRef,
      articleId,
      TODAY_COVER_URL,
      tagColors: ['', 'success', 'info', 'warning', 'danger'],
      textSize: ref(0),
      mermaid: process.client ? (window as any).mermaid : undefined,
    };
    const _Methods = {
      ...Art._Methods,

      refreshData: () => {},
      async getArticle() {
        _Methods.refreshData = () => {};
        const { data, refresh } = await useAsyncData(
          route.fullPath,
          () => getArticleDetail(articleId),
          {
            // to do 使用了initialCache，刷新页面时会在浏览器额外再请求一次
            // initialCache: false,
            default: () => ({ data: {} as ArticleEntity }),
          },
        );
        const article = data.value!.data;
        _Methods.refreshData = refresh;
        article.content = xss.filterXSS(article.content, {
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
        Data.article.value = article;
      },
    };
    const Methods = {
      ...Art.Methods,
      onClickAnchor(title: string) {
        if (!Data.articleRef.value) return;
        const heading = Data.articleRef.value.querySelector(`#${title}`) as HTMLElement;
        heading.scrollIntoView({ block: 'center', behavior: 'smooth' });
      },
    };
    const init = () => {
      // _Methods.refreshData();
      Art.setArticleId(articleId);
      _Methods.getLikeCountData();

      if (process.client) {
        Art._Methods.resolveArticleRender();
        Data.textSize.value = (Art.Data.articleRef.value?.innerText || '').replace(
          /[\n ]+/g,
          '',
        ).length;
        anchorRef.value.parseTree(Data.articleRef.value);
      }
    };

    // if (process.client) console.log('11115', window.__NUXT__, route.fullPath);
    if (process.client && !(window as any).__NUXT__.data[route.fullPath]) {
      onMounted(() => {
        _Methods.getArticle().then(init);
      });
    } else {
      onMounted(init);
      await _Methods.getArticle();
    }
    return {
      ...Data,
      ...Methods,
    };
  },
});
</script>
<style lang="scss">
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
  .cover-content {
    color: var(--navbar-text-color);
    .article-title {
      font-size: 36px;
      text-align: center;
    }
    .cate-tags {
      margin-top: 10px;
      font-size: 14px;
      text-align: center;
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
    .view-like {
      margin-top: 10px;
      .view-count {
        margin-right: 10px;
      }
    }
  }
  .pg-content {
    flex: 1;
    position: relative;
    padding: 1rem 0;
    width: 100%;
    audio {
      position: fixed;
      right: 0;
      top: 77px;
      height: 40px;
    }
    section {
      padding: 1rem 2rem;
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
        aside {
          position: absolute;
          left: 100%;
          top: 0;
          bottom: 0;
          width: 200px;
          @media (max-width: 1200px) {
            display: none;
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