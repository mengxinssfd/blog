import { Feed } from 'feed';
import { Readable } from 'stream';
import { getArticles } from '~/server/utils';

// 注意：server的import.meta.env跟其它地方的env不一样，在服务器需要手动注入
// 例如：在pm2的env中填入，否则会为空
const hostname = import.meta.env.VITE_BASE_URL;

async function buildRss() {
  const feed = new Feed({
    title: "Nice's Blog",
    description: 'This is my personal feed!',
    id: hostname,
    link: hostname,
    language: 'zh', // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
    image: hostname + '/favicon.ico',
    favicon: hostname + '/favicon.ico',
    copyright: 'All rights reserved 2023, DYH',
    //    updated: new Date(2023, 12, 31), // optional, default = today
    generator: 'awesome', // optional, default = 'Feed for Node.js'
    feedLinks: {
      json: hostname + '/json',
      atom: hostname + '/atom',
    },
    author: {
      name: 'DYH',
      email: 'xinzon32177@163.com',
      link: hostname,
    },
  });
  const list = await getArticles({ maxPages: 1 });
  list.forEach((post) => {
    const link = `${hostname}/article/detail/${post.id}`;
    const author = post.author;
    const authorInfo = {
      name: author.nickname,
      email: author.email,
      link: `${hostname}/user/info/${author.id}`,
    };
    feed.addItem({
      title: post.title,
      id: link,
      link,
      description: post.description,
      content: post.content,
      author: [authorInfo],
      contributor: [authorInfo],
      date: new Date(post.updateAt),
      image: post.cover,
      published: new Date(post.createAt),
      category: [
        { term: post.category.name, scheme: `${hostname}?cate=${post.category.id}` },
        ...post.tags.map((it) => ({
          term: it.name,
          scheme: `${hostname}?tags=${it.id}`,
        })),
      ],
    });
  });
  return feed.atom1();
}

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/xml',
    'Content-Disposition': 'inline; filename="atom.xml"',
  });

  const content = await buildRss();
  const stream = Readable.from(content);

  return sendStream(event, stream);
});
