<script setup lang="ts">
import * as xss from 'xss';
import { createHtmlElement } from '@tool-pack/dom';
import { Clipboard as ClipboardKit } from '@tool-pack/bom';
import { ElMessage } from 'element-plus';
import highlight from 'highlight.js';
import ImgZoom from '@mxssfd/img-zoom';
import mermaid from 'mermaid';
import { markdownToHtml } from '~/feature/markdown-it';

mermaid.initialize({ startOnLoad: false });

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
  isMd: {
    type: Boolean,
    default: false,
  },
  isPreview: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['wordCountChange']);

const articleRef = ref<HTMLElement>();

const baseAttrs = ['class', 'id', 'style'];
const baseWhiteList = (
  [
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'div',
    'code',
    'pre',
    'i',
    'ul',
    'ol',
    'li',
    'blockquote',
    'table',
    'thead',
    'tbody',
    'tfoot',
    'tr',
    'td',
    'th',
    'em',
    'sub',
    'sup',
    'span',
    'hr',
    'section',
  ] satisfies (keyof HTMLElementTagNameMap)[]
).reduce(
  // eslint-disable-next-line no-sequences
  (prev, cur) => ((prev[cur] = baseAttrs), prev),
  {} as Record<keyof HTMLElementTagNameMap, string[]>,
);
const emptyWhiteList = (
  ['br', 's', 'strong', 'u'] satisfies (keyof HTMLElementTagNameMap)[]
).reduce(
  // eslint-disable-next-line no-sequences
  (prev, cur) => ((prev[cur] = []), prev),
  {} as Record<keyof HTMLElementTagNameMap, string[]>,
);

const filterContent = computed(() => {
  let content = props.content;
  if (!content) return '';
  content = props.isMd ? markdownToHtml(props.content) : props.content;
  return xss.filterXSS(content, {
    whiteList: {
      ...baseWhiteList,
      ...emptyWhiteList,
      svg: ['viewBox', 'data-icon', 'width', 'height', 'fill', 'aria-hidden'],
      rect: ['x', 'y', 'width', 'height', 'fill'],
      path: ['d'],
      img: [...baseAttrs, 'src'],
      a: [...baseAttrs, 'href'],
      input: [...baseAttrs, 'checked', 'disabled', 'type'],
      iframe: [
        ...baseAttrs,
        'src',
        'width',
        'height',
        'style',
        'scrolling',
        'border',
        'frameborder',
        'framespacing',
        'allowfullscreen',
      ],
    },
    /* onTag(tag, html) {
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
          // console.log('bbbb', tag, html);
          // if (tag === 'path') return html;
          // if (['input', 'br'].includes(tag)) return html;
        }, */
    /* onTagAttr(_tag, name, value) {
          // tag是当前的标签名称，比如<a>标签，则tag的值是'a'
          // name是当前属性的名称，比如href="#"，则name的值是'href'
          // value是当前属性的值，比如href="#"，则value的值是'#'
          // isWhiteAttr是否为白名单上的属性
          // 如果返回一个字符串，则当前属性值将被替换为该字符串
          // 如果不返回任何值，则使用默认的处理方法
          //   在白名单上：  调用safeAttrValue来过滤属性值，并输出该属性，详见下文
          //   不在白名单上：通过onIgnoreTagAttr指定，详见下文

          console.log('name', name);
          if (['id', 'class', 'align', 'style'].includes(name)) return `${name}="${value}"`;
        }, */
  });
});

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

  if (props.isPreview) return;

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
    if (!reg.test(link.href)) {
      link.target = '_blank';
      link.href = '/link?target=' + encodeURIComponent(link.href);
    }
  });

  // 流程图
  // https://mermaid.js.org/config/usage.html
  mermaid.run({ nodes: articleEl.querySelectorAll('.mermaid') });

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
    class="c-md-viewer markdown-body"
    :class="{ preview: isPreview }"
    v-html="filterContent"></article>
</template>

<style lang="scss">
@import 'highlight.js/styles/atom-one-dark';
@import '@/styles/vuepress';
//@import '@/styles/markdown';
.c-md-viewer {
  background: none;
  color: var(--text-color);
  code {
    color: #fff;
    background: #292a2d;
  }
  pre {
    position: relative;
    padding: 1rem 1rem 0;
    background: #292a2d;
    code {
      padding: 0;
      color: #fff;
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
    + pre {
      margin-top: 10px;
    }
  }
  pre code ul {
    list-style: none;
    counter-reset: index;
    padding: 0;
    li {
      display: table-row;
      white-space: pre-wrap;
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
  .mermaid {
    &:not([data-processed]) {
      display: none;
    }
    .edgePaths .edgePath path,
    .flowchart-link,
    .marker {
      stroke: var(--text-color) !important;
    }
  }
  .footnotes-sep {
    margin-top: 10px;
  }
  .img-zoom-wrapper {
    cursor: zoom-out;
    img {
      cursor: move;
    }
  }
  &:not(.preview) {
    img {
      cursor: zoom-in;
    }
  }
  &.preview {
    pointer-events: none;
  }
  code[class*='language-'],
  pre[class*='language-'] {
    text-shadow: none;
  }
}
</style>
