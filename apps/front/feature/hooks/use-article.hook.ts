import { computed, onBeforeUnmount, ref } from 'vue';
import { formatDate } from '@tool-pack/basic';
import { Clipboard as ClipboardKit } from '@tool-pack/bom';
import { createHtmlElement } from '@tool-pack/dom';
import { ElMessage } from 'element-plus';
import highlight from 'highlight.js';
import ImgZoom from '@mxssfd/img-zoom';
import { getArticleLikeCount, setArticleLike } from '@blog/apis';
import { ROLE, ArticleEntity } from '@blog/entities';
import useUserStore from '~/store/user';

export function useArticle() {
  type ArticleId = string | number;
  const previewRef = ref();
  let articleId: any = '';
  const onBeforeUnmountHandlerList: Function[] = [];
  onBeforeUnmount(() => onBeforeUnmountHandlerList.forEach((i) => i()));
  const store = useUserStore();
  const Data = {
    ROLE,
    articleRef: ref<HTMLElement>(),
    previewRef,
    audioVisible: ref(true),
    user: computed(() => store.user),
    article: ref<ArticleEntity>({} as any),
    like: ref({
      count: 0,
      checked: 0,
    }),
  };
  const _Methods = {
    async getLikeCountData() {
      const res = await getArticleLikeCount(articleId);
      Data.like.value = res.data || Data.like.value;
    },
    resolveArticleRender() {
      const articleEl = Data.articleRef.value as HTMLElement;
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
        onBeforeUnmountHandlerList.push(() => iz.destroy());
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
        // 从缓存读取也需要5ms
        setTimeout(() => {
          // (window as any).mermaid?.initialize({ startOnLoad: false });
          if (!(window as any).mermaid) return;
          const now = Date.now();
          mermaids.forEach((item, index) => {
            // mermaid加载完成后渲染的不需要再次渲染
            if (item.innerHTML.startsWith('<svg')) return;
            const id = 'mermaid-' + now + '-' + index;
            const content = item.innerHTML.replace(/&gt;/g, '>');
            (window as any).mermaid.mermaidAPI.render(id, content, (svgCode: string) => {
              item.innerHTML = svgCode;
            });
            item.style.display = 'block';
          });
        }, 100);
      }
    },
  };
  const Methods = {
    formatDate(time: string): string {
      if (!time) return '--';
      return formatDate(new Date(time), 'yyyy-MM-dd hh:mm');
    },
    async setLike() {
      const res = await setArticleLike(articleId);
      Data.like.value = res.data || Data.like.value;
    },
    onCommentLockUpdate() {
      Data.article.value.commentLock = !Data.article.value.commentLock;
    },
  };
  return {
    Data,
    _Methods,
    Methods,
    setArticleId(id: ArticleId) {
      articleId = id;
    },
  };
}
