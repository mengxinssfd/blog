import * as Marked from 'marked';
// import hljs = require('highlight.js');
function initMarked(marked: typeof Marked.marked) {
  // 使用服务器渲染会很慢
  // marked.setOptions({
  //   renderer: new marked.Renderer(),
  //   highlight(code: string, lang: string) {
  //     // console.log(lang);
  //     const language = hljs.getLanguage(lang) ? lang : 'plaintext';
  //     return hljs.highlight(code, { language }).value;
  //   },
  //   langPrefix: 'hljs language-', // highlight.js css expects a top-level 'hljs' class.
  //   pedantic: false,
  //   gfm: true,
  //   breaks: false,
  //   sanitize: false,
  //   smartLists: true,
  //   smartypants: false,
  //   xhtml: false,
  // });
  const renderer = new marked.Renderer();
  const originCode = renderer.code;
  renderer.code = function (code: string, lang: string) {
    // 流程图
    if (lang === 'mermaid') {
      return `<div class='mermaid'>${code}</div>`;
    }
    // eslint-disable-next-line prefer-rest-params
    return originCode.apply(this, arguments as any);
  };

  // 修复 `- [x] [test](https://test.com/xxxx)`格式会丢失checkbox的问题
  const originListItem = renderer.listitem;
  renderer.listitem = function (this: any, text: string, flag1: boolean, flag2?: boolean) {
    const reg = /^<p><a href="/;
    if (reg.test(text) && flag1 && typeof flag2 === 'boolean') {
      text = text.replace(
        reg,
        `<p><input ${flag2 ? 'checked="" ' : ''}disabled="" type="checkbox"> <a href="`,
      );
    }
    return (originListItem as any).call(this, text, flag1, flag2);
  } as any;

  return renderer;
}

const renderer = initMarked(Marked.marked);

export function markdownToHtml(markdown: string): string {
  // 这样转换把代码里面的都换掉了
  // return marked(markdown.replace(/\n(?=\n)/g, '\n<br/>\n'), { renderer });
  return Marked.marked(markdown, { renderer });
}
