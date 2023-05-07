<script setup lang="ts">
import { Editor } from '@toast-ui/editor';
import codeSyntaxHighlight from '@toast-ui/editor-plugin-code-syntax-highlight';
import colorSyntax from '@toast-ui/editor-plugin-color-syntax';
import * as Prism from 'prismjs';
import tableMergedCell from '@toast-ui/editor-plugin-table-merged-cell';
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css';
import '@toast-ui/editor-plugin-color-syntax/dist/toastui-editor-plugin-color-syntax.css';
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css';
import 'prismjs/themes/prism.min.css';
import '@toast-ui/editor/dist/i18n/zh-cn';
import { Keymap } from '@tool-pack/keymap';
import '~/styles/toastui-color-syntax.scss';
import * as Prettier from 'prettier';
import parserMD from 'prettier/esm/parser-markdown.mjs';
import { sleep } from '@tool-pack/basic';
import { uploadFile } from '@blog/apis';
import { Theme, ThemeKeys } from '~/setup/theme.setup';

const props = defineProps({
  height: {
    type: String,
    default: '600px',
  },
  value: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:value', 'save']);
const editorDomRef = ref<HTMLElement>();
let editor: Editor;
const theme = useState<Theme>(ThemeKeys.type);
const content = computed({ set: (v: string) => emit('update:value', v), get: () => props.value });

function setTheme() {
  const editorDom: any = editorDomRef.value;
  if (theme.value === Theme.dark) {
    editorDom.classList.add('toastui-editor-dark');
  } else {
    editorDom.classList.remove('toastui-editor-dark');
  }
}

onMounted(() => {
  editor = new Editor({
    el: editorDomRef.value as HTMLElement,
    previewStyle: 'vertical',
    height: props.height,
    language: 'zh-CN',
    usageStatistics: true,
    useCommandShortcut: false,
    customHTMLRenderer: {
      htmlBlock: {
        iframe(node) {
          return [
            { type: 'openTag', tagName: 'iframe', outerNewLine: true, attributes: node.attrs },
            { type: 'html', content: node.childrenHTML as string },
            { type: 'closeTag', tagName: 'iframe', outerNewLine: true },
          ];
        },
        video(node) {
          return [
            { type: 'openTag', tagName: 'video', outerNewLine: true, attributes: node.attrs },
            { type: 'html', content: node.childrenHTML as string },
            { type: 'closeTag', tagName: 'video', outerNewLine: true },
          ];
        },
      },
    },
    initialValue: props.value,
    plugins: [[codeSyntaxHighlight, { highlighter: Prism }], colorSyntax, tableMergedCell],
    hooks: {
      addImageBlobHook: (file, callback) =>
        uploadFile(file)
          .then(({ data }) => callback(data))
          .catch(callback),
    },
  });

  editor.on('change', () => {
    content.value = editor.getMarkdown();
  });
  watch(theme, setTheme, { immediate: true });
  watch(content, async (n) => {
    if (n !== editor.getMarkdown()) {
      const scrollTop = editor.getScrollTop();
      const s = editor.getSelection();
      const selection = (Array.isArray(s[0]) ? s[0] : s) as [number, number];

      editor.setMarkdown(n);

      await sleep(10);
      editor.setScrollTop(scrollTop);
      editor.setSelection(selection);
    }
  });

  function exec(name: string, payload?: Record<string, any>) {
    return (e: KeyboardEvent | undefined) => {
      e?.stopPropagation();
      e?.preventDefault();
      editor.exec(name, payload);
    };
  }

  const isWin = /win/i.test(navigator.userAgent);
  const keymap = new Keymap({ el: editorDomRef.value as HTMLDivElement }, [
    { desc: '回退', keys: 'MetaOrControl+z', handler: exec('undo') },
    { desc: '前进', keys: isWin ? 'Control+y' : 'MetaOrControl+Shift+z', handler: exec('redo') },
    {
      desc: '格式化',
      keys: 'MetaOrControl+Shift+f',
      handler: (e) => {
        e?.stopPropagation();
        e?.preventDefault();

        content.value = Prettier.format(content.value, {
          parser: 'markdown',
          plugins: [parserMD],

          // 以下来自.prettierrc.js

          // 一行最多 100 字符
          printWidth: 100,
          // 使用 2 个空格缩进
          tabWidth: 2,
          // 不使用缩进符使用空格
          useTabs: false,
          // 行尾需要有分号
          semi: true,
          // 使用单引号
          singleQuote: true,
          // 对象的 key 仅在必要时用引号
          quoteProps: 'as-needed',
          // jsx 不使用单引号，而使用双引号
          jsxSingleQuote: false,
          // 尾随逗号
          trailingComma: 'all',
          // 大括号内的首尾需要空格
          bracketSpacing: true,
          // jsx 标签的反尖括号需要换行
          jsxBracketSameLine: false,
          // 箭头函数，只有一个参数的时候，也需要括号
          arrowParens: 'always',
          // 使用默认的折行标准
          proseWrap: 'preserve',
          // 根据显示样式决定 html 要不要折行
          htmlWhitespaceSensitivity: 'css',
          // 换行符使用 auto
          endOfLine: 'auto',
        });
      },
    },
    {
      desc: '加粗',
      keys: 'CommandOrControl+Shift+b',
      handler: exec('bold'),
    },
    {
      desc: '斜体',
      keys: 'CommandOrControl+Shift+i',
      handler: exec('italic'),
    },
    {
      desc: '删除线',
      keys: 'CommandOrControl+Shift+d',
      handler: exec('strike'),
    },
    {
      desc: '注释',
      keys: 'CommandOrControl+/',
      handler: exec('comment'),
    },
    {
      desc: '行内代码块',
      keys: 'CommandOrControl+7',
      handler: exec('code'),
    },
    {
      desc: '链接',
      keys: 'CommandOrControl+Shift+l',
      handler: exec('addLink', { linkUrl: 'https://', linkText: '链接' }),
    },
    {
      desc: '图形',
      keys: 'CommandOrControl+Shift+p',
      handler: exec('addImage', { imageUrl: 'https://', altText: '图片说明' }),
    },

    ...['一', '二', '三', '四', '五', '六'].map((num, index) => {
      const level = index + 1;
      return {
        desc: num + '级标题',
        keys: 'CommandOrControl+' + level,
        handler: exec('heading', { level }),
      };
    }),

    {
      desc: '段落',
      keys: 'CommandOrControl+0',
      handler: exec('heading', { level: 0 }),
    },
    {
      desc: '代码块',
      keys: 'CommandOrControl+Shift+C',
      handler: exec('codeBlock'),
    },
    {
      desc: '引用',
      keys: 'CommandOrControl+8',
      handler: exec('blockQuote'),
    },
    {
      desc: '有序列表',
      keys: 'CommandOrControl+Shift+o',
      handler: exec('orderedList'),
    },
    {
      desc: '无序列表',
      keys: 'CommandOrControl+Shift+u',
      handler: exec('bulletList'),
    },
    {
      desc: '任务列表',
      keys: 'CommandOrControl+Shift+x',
      handler: exec('taskList'),
    },
    {
      desc: '水平分割线',
      keys: 'CommandOrControl+Shift+-',
      handler: exec('hr'),
    },
    {
      desc: 'Custom Block',
      keys: 'CommandOrControl+Shift+m',
      handler: exec('customBlock', { info: 'myCustom' }),
    },
  ]);
  keymap.add({
    desc: '控制台打印快捷键映射',
    keys: 'MetaOrControl+l',
    handler(e) {
      e?.stopPropagation();
      e?.preventDefault();
      console.table(keymap.maps);
    },
  });

  // 注释命令
  const commentCommand = () => {
    const selectedText = editor.getSelectedText();

    const content = /^<!--(.+)-->$/.test(selectedText)
      ? RegExp.$1.trim()
      : `<!--  ${selectedText}  -->`;

    editor.insertText(content);

    return true;
  };
  editor.addCommand('markdown', 'comment', commentCommand);
  editor.addCommand('wysiwyg', 'comment', commentCommand);
});
</script>
<template>
  <div class="md-editor">
    <div ref="editorDomRef" class="editor-wrapper"></div>
  </div>
</template>

<style lang="scss" scoped>
.md-editor {
  position: relative;
  box-sizing: border-box;
  .toastui-editor-defaultUI {
    border-radius: 0;
  }
  .toastui-editor-md-tab-container {
    display: none !important;
  }
  .toastui-editor-mode-switch[toggle-status='hide'] {
    margin-top: -1px;
  }
}
</style>
