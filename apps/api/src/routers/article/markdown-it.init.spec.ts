import { markdownToHtml } from './markdown-it.init';

describe('markdown-it.init', () => {
  it('base', () => {
    const content = `
# hello world
# hello world

text

\`\`\`javascript
console.log(123)
\`\`\`  

# link
[test](https://test.com){.test #id data-index=123}
<a href='https://baidu.com'>百度一下，你就知道</a>
https://baidu.com
<script src='test.js'></script>
![test](https://test.com/test.png){style=width:300px;height=300px}

# task

- [x] test
- [x] [test](https://test.com){.test #id data-index=123}

# container

::: warning
hello world
:::
::: info
hello world
:::
::: success
hello world
:::
::: error
hello world
:::

`;

    expect(markdownToHtml(content)).toBe(
      `
<h1 id="hello-world"><a class="anchor" href="#hello-world"><span class="octicon octicon-link"></span></a>hello world</h1>
<h1 id="hello-world-2"><a class="anchor" href="#hello-world-2"><span class="octicon octicon-link"></span></a>hello world</h1>
<p>text</p>
<pre><code class="language-javascript">console.log(123)
</code></pre>
<h1 id="link"><a class="anchor" href="#link"><span class="octicon octicon-link"></span></a>link</h1>
<p><a href="https://test.com" class="test" id="id" data-index="123">test</a><br />
<a href='https://baidu.com'>百度一下，你就知道</a><br />
<a href="https://baidu.com">https://baidu.com</a></p>
<script src='test.js'></script>
<p><img src="https://test.com/test.png" alt="test" style="width:300px;height=300px" /></p>
<h1 id="task"><a class="anchor" href="#task"><span class="octicon octicon-link"></span></a>task</h1>
<ul class="contains-task-list">
<li class="task-list-item"><input class="task-list-item-checkbox" checked="" disabled="" type="checkbox"> test</li>
<li class="task-list-item"><input class="task-list-item-checkbox" checked="" disabled="" type="checkbox"> <a href="https://test.com" class="test" id="id" data-index="123">test</a></li>
</ul>
<h1 id="container"><a class="anchor" href="#container"><span class="octicon octicon-link"></span></a>container</h1>
<div class="md-alert md-alert-warning"><i class="md-alert-icon md-alert-icon-warning"><svg viewBox="64 64 896 896" data-icon="exclamation-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" class=""><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-32 232c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V296zm32 440a48.01 48.01 0 0 1 0-96 48.01 48.01 0 0 1 0 96z"></path></svg></i><p>hello world</p>
</div>
<div class="md-alert md-alert-info"><i class="md-alert-icon md-alert-icon-info"><svg viewBox="64 64 896 896" data-icon="info-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" class=""><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm32 664c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V456c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272zm-32-344a48.01 48.01 0 0 1 0-96 48.01 48.01 0 0 1 0 96z"></path></svg></i><p>hello world</p>
</div>
<div class="md-alert md-alert-success"><i class="md-alert-icon md-alert-icon-success"><svg viewBox="64 64 896 896" data-icon="check-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" class=""><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 0 1-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z"></path></svg></i><p>hello world</p>
</div>
<div class="md-alert md-alert-error"><i class="md-alert-icon md-alert-icon-error"><svg viewBox="64 64 896 896" data-icon="close-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" class=""><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.4l-99.3 118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5 359a8.32 8.32 0 0 1-1.9-5.2c0-4.4 3.6-8 8-8l66.1.3L512 464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9 5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"></path></svg></i><p>hello world</p>
</div>
`.trimStart(),
    );
  });
  test('text code', () => {
    expect(
      markdownToHtml(`
<div>hello world</div>    

\`\`\`mermaid
flowchart TD 
  Start --> Stop
\`\`\`
    `),
    ).toBe(
      `
<div>hello world</div>    
<div class='mermaid'>flowchart TD 
  Start --> Stop
</div>`.trimStart(),
    );
  });
  test('toc', () => {
    expect(
      markdownToHtml(`
[toc]
# 1
# 2
## 2-1
# 3
    `),
    ).toBe(
      `
<p>
<ul class="toc">
  <li>
    <a href="#1">1</a>
  </li>
  <li>
    <a href="#2">2</a>
    <ul>
      <li>
        <a href="#2-1">2-1</a>
      </li>
    </ul>
  </li>
  <li>
    <a href="#3">3</a>
  </li>
</ul>
</p>
<h1 id="1"><a class="anchor" href="#1"><span class="octicon octicon-link"></span></a>1</h1>
<h1 id="2"><a class="anchor" href="#2"><span class="octicon octicon-link"></span></a>2</h1>
<h2 id="2-1"><a class="anchor" href="#2-1"><span class="octicon octicon-link"></span></a>2-1</h2>
<h1 id="3"><a class="anchor" href="#3"><span class="octicon octicon-link"></span></a>3</h1>
`.trimStart(),
    );
  });
  test('footnote', () => {
    expect(
      markdownToHtml(`
Here is a footnote reference,[^1] and another.[^longnote]

[^1]: Here is the footnote.

[^longnote]: Here's one with multiple blocks.

Subsequent paragraphs are indented to show that they
belong to the previous footnote.
    `),
    ).toBe(
      `
<p>Here is a footnote reference,<sup class="footnote-ref"><a href="#fn1" id="fnref1">[1]</a></sup> and another.<sup class="footnote-ref"><a href="#fn2" id="fnref2">[2]</a></sup></p>
<p>Subsequent paragraphs are indented to show that they<br />
belong to the previous footnote.</p>
<hr class="footnotes-sep" />
<section class="footnotes">
<ol class="footnotes-list">
<li id="fn1" class="footnote-item"><p>Here is the footnote. <a href="#fnref1" class="footnote-backref">↩︎</a></p>
</li>
<li id="fn2" class="footnote-item"><p>Here's one with multiple blocks. <a href="#fnref2" class="footnote-backref">↩︎</a></p>
</li>
</ol>
</section>
`.trimStart(),
    );
  });
});
