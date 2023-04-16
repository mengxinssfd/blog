import { ServerRequest } from '~/feature/request/sever';
import { getArticleList, setRequestIns } from '@blog/apis';
import { getMilliseconds } from '@tool-pack/basic';
import type { ArticleEntity } from '@blog/entities';

setRequestIns(ServerRequest.ins);

export async function getArticles(
  options: {
    cb?: (list: ArticleEntity[], page: number, pageCount: number) => void;
    maxPages?: number;
    pageSize?: number;
  } = {},
) {
  let page = 1;
  let pageCount = 1;
  const pageSize = options.pageSize ?? 20;
  const result = [];
  // 文章详情页
  do {
    const {
      data: { list = [], count = 1 },
    } = await getArticleList(
      { pageSize, page, sort: 3, tags: [] },
      { enable: true, timeout: getMilliseconds({ hours: 1 }) },
    );
    pageCount = count;
    result.push(...list);
    options.cb && options.cb(list, page, count);
    page++;
  } while (page <= Math.ceil((options.maxPages ?? pageCount) / pageSize));

  return result;
}
