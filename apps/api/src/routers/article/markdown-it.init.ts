import MarkdownIt = require('markdown-it');
import attrs = require('markdown-it-attrs');
import taskLists = require('markdown-it-task-lists');
import container = require('markdown-it-container');
import githubToc from 'markdown-it-github-toc';
import footnote = require('markdown-it-footnote');

type Tokens = ReturnType<ReturnType<typeof MarkdownIt>['parse']>;

function getContainerParams(type: 'warning' | 'info' | 'success' | 'error') {
  const matches: Record<typeof type, string> = {
    warning: `<svg viewBox="64 64 896 896" data-icon="exclamation-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" class=""><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-32 232c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V296zm32 440a48.01 48.01 0 0 1 0-96 48.01 48.01 0 0 1 0 96z"></path></svg>`,
    info: `<svg viewBox="64 64 896 896" data-icon="info-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" class=""><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm32 664c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V456c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272zm-32-344a48.01 48.01 0 0 1 0-96 48.01 48.01 0 0 1 0 96z"></path></svg>`,
    success: `<svg viewBox="64 64 896 896" data-icon="check-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" class=""><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 0 1-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z"></path></svg>`,
    error: `<svg viewBox="64 64 896 896" data-icon="close-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" class=""><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.4l-99.3 118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5 359a8.32 8.32 0 0 1-1.9-5.2c0-4.4 3.6-8 8-8l66.1.3L512 464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9 5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"></path></svg>`,
  };
  const icon = matches[type];
  return [
    type,
    {
      validate: (params: string): boolean => params.trim() === type,
      render(tokens: Tokens, idx: number): string {
        if (tokens[idx]?.nesting !== 1) return '</div>\n';
        return `<div class="md-alert md-alert-${type}"><i class="md-alert-icon md-alert-icon-${type}">${icon}</i>`;
      },
    },
  ];
}

// full options list (defaults)
const md = MarkdownIt({
  html: true, // Enable HTML tags in source
  xhtmlOut: true, // Use '/' to close single tags (<br />).
  // This is only for full CommonMark compatibility.
  breaks: true, // Convert '\n' in paragraphs into <br>
  langPrefix: 'language-', // CSS language prefix for fenced blocks. Can be
  // useful for external highlighters.
  linkify: true, // Autoconvert URL-like text to links

  // Enable some language-neutral replacement + quotes beautification
  // For the full list of replacements, see https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.js
  typographer: false,

  // Double + single quotes replacement pairs, when typographer enabled,
  // and smartquotes on. Could be either a String or an Array.
  //
  // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
  // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
  quotes: '“”‘’',

  // Highlighter function. Should return escaped HTML,
  // or '' if the source string is not changed and should be escaped externally.
  // If result starts with <pre... internal wrapper is skipped.
  // highlight: function (/*str, lang*/) {
  //   return '';
  // },
  // eslint-disable-next-line @typescript-eslint/no-var-requires
})
  .use(attrs, {
    // optional, these are default options
    leftDelimiter: '{',
    rightDelimiter: '}',
    // allowedAttributes: ['id', 'class'], // empty array = all attributes are allowed
  })
  .use(taskLists)
  .use(container, ...getContainerParams('warning'))
  .use(container, ...getContainerParams('info'))
  .use(container, ...getContainerParams('success'))
  .use(container, ...getContainerParams('error'))
  .use(githubToc, {
    // anchorLink: false,
    // tocFirstLevel: 2,
    // tocLastLevel: 3,
    // tocClassName: 'toc',
    // anchorLinkSymbol: '',
    // anchorLinkSpace: false,
    // anchorClassName: 'anchor',
    // anchorLinkSymbolClassName: 'octicon octicon-link',

    anchorClassName: 'anchor',
    anchorLinkSpace: false,
    anchorLinkSymbol: '',
    anchorLinkSymbolClassName: 'octicon octicon-link',
    tocClassName: 'toc',
    // tocFirstLevel: 2,
    // tocLastLevel: 3,
  })
  .use(footnote);

const originFence = md.renderer.rules.fence!.bind(md.renderer.rules);
md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
  const token = tokens[idx];
  if (token?.info === 'mermaid') {
    return `<div class='mermaid'>${token.content}</div>`;
  }

  return originFence(tokens, idx, options, env, slf);
};

export function markdownToHtml(markdown: string) {
  return md.render(markdown);
}
