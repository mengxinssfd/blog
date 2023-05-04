import MarkdownIt from 'markdown-it';
import attrs from 'markdown-it-attrs';
import taskLists from 'markdown-it-task-lists';

let md: MarkdownIt;
function getMd() {
  if (!md) {
    md = MarkdownIt({
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
      .use(taskLists);
  }
  return md;
}
export function markdownToHtml(markdown: string) {
  return getMd().render(markdown);
}
