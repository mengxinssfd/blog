<script setup lang="ts">
import 'highlight.js/styles/atom-one-dark.css';
import '~/styles/vuepress.css';
import * as xss from 'xss';
import { createHtmlElement } from '@tool-pack/dom';
import { Clipboard as ClipboardKit } from '@tool-pack/bom';
import { ElMessage } from 'element-plus';
import highlight from 'highlight.js';
import ImgZoom from '@mxssfd/img-zoom';
import { onMounted } from '#imports';

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
  isMd: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['wordCountChange']);

const articleRef = ref<HTMLElement>();

const filterContent = computed(() =>
  props.content
    ? xss.filterXSS(props.content, {
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
      })
    : '',
);

const clearList = ref<Function[]>([]);
onBeforeUnmount(() => {
  clearList.value.forEach((i) => i());
  clearList.value = [];
});

const resolveArticleRender = () => {
  const articleEl = articleRef.value;
  if (!articleEl) return;
  // code添加复制按钮
  const blocks = articleEl.querySelectorAll<HTMLElement>('pre code');
  blocks.forEach((block) => {
    createHtmlElement('div', {
      props: {
        className: '_ abs-tr btn copy-code',
        innerText: 'copy',
        async onclick() {
          await ClipboardKit.copy(block);
          ElMessage({ type: 'success', message: '代码已复制到剪贴板' });
        },
      },
      parent: block.parentElement as HTMLElement,
    });
    //  语言类型
    createHtmlElement('div', {
      props: {
        className: '_ abs-tl lang-type',
        innerText: /language-(\w+)\b/.test(block.className) ? RegExp.$1 : '',
      },
      parent: block.parentElement as HTMLElement,
    });
    highlight.highlightBlock(block);
    block.innerHTML =
      '<ul><li><div>' +
      block.innerHTML.replace(/\n(?!$)/g, '</div></li><li><div>') +
      '</div></li></ul>';
  });

  // 图片点击放大
  const img = articleEl.querySelectorAll<HTMLElement>('img');
  if (img.length) {
    const iz = new ImgZoom({ triggerEl: img });
    clearList.value.push(() => iz.destroy());
    // onBeforeUnmount必须在setup执行期间才起作用
    // onBeforeUnmount(() => iz.destroy());
  }

  // 外链
  const links = articleEl.querySelectorAll<HTMLAnchorElement>('a');
  const reg = new RegExp(`^${location.origin}`);
  links.forEach((link) => {
    link.target = '_blank';
    if (!reg.test(link.href)) {
      link.href = '/link?target=' + encodeURIComponent(link.href);
    }
  });

  // 流程图
  const mermaids = articleEl.querySelectorAll<HTMLElement>('.mermaid');
  if (mermaids.length) {
    const mermaid = (window as any).mermaid;
    // 从缓存读取也需要5ms
    setTimeout(() => {
      // (window as any).mermaid?.initialize({ startOnLoad: false });
      if (!mermaid) return;
      const now = Date.now();
      mermaids.forEach((item, index) => {
        // mermaid加载完成后渲染的不需要再次渲染
        if (item.innerHTML.startsWith('<svg')) return;
        const id = 'mermaid-' + now + '-' + index;
        const content = item.innerHTML.replace(/&gt;/g, '>');
        mermaid.mermaidAPI.render(id, content, (svgCode: string) => {
          item.innerHTML = svgCode;
        });
        item.style.display = 'block';
      });
    }, 100);
  }

  emit('wordCountChange', (articleRef.value?.innerText || '').replace(/[\n\s]+/g, '').length);
};

onMounted(() => {
  watch(
    () => props.content,
    async (n) => {
      if (n) {
        await nextTick();
        resolveArticleRender();
      }
    },
    { immediate: true },
  );
});
</script>

<template>
  <article
    v-if="content"
    ref="articleRef"
    class="c-md-viewer vuepress-markdown-body"
    v-html="filterContent"></article>
</template>

<style lang="scss">
.c-md-viewer {
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
  pre code ul {
    list-style: none;
    counter-reset: index;
    padding: 0;
    li {
      display: table-row;
      white-space: pre-line;
      word-break: break-word;
      div {
        margin-left: 5px;
      }
      &:before {
        display: table-cell;
        padding: 0 5px;
        text-align: right;
        border-right: 1px solid #858585;
        white-space: nowrap;
        counter-increment: index; // 自增1
        content: counter(index);
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
