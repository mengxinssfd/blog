import { SitemapStream } from 'sitemap';
import { getArticles } from '~/server/utils';
import { type Stream } from 'stream';

const hostname = import.meta.env.VITE_BASE_URL;

function buildSitemap() {
  const sitemap = new SitemapStream({ hostname });

  // 首页
  sitemap.write({ url: '/', changefreq: 'daily', priority: 0.9 });
  // 关于
  sitemap.write({ url: '/about', changefreq: 'monthly', priority: 0.3 });
  // 友链
  sitemap.write({ url: '/friend-link', changefreq: 'monthly', priority: 0.3 });
  //  sitemap.write({ url: '/article/detail/:id', changefreq: 'monthly', priority: 0.3 });

  getArticles({
    cb: (list, page) => {
      // 首页分页
      sitemap.write({ url: '/?page=' + page, changefreq: 'weekly', priority: 0.6 });
      // 文章详情页
      for (const article of list) {
        sitemap.write({
          url: '/article/detail/' + article.id,
          changefreq: 'weekly',
          priority: 0.6,
        });
      }
    },
  }).then(() => sitemap.end());

  return sitemap;
}

export default defineEventHandler(async (event) => {
  const stream: Stream = buildSitemap();
  setResponseHeaders(event, {
    'Content-Type': 'application/xml',
    'Content-Disposition': 'inline; filename="sitemap.xml"',
  });
  return sendStream(event, stream);
});
