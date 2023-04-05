import { Get, Post } from '@blog/apis';

const urlPrefix = '/api/article-like';

export function getArticleLikeCount(articleId: number) {
  return Get(`${urlPrefix}/count/${articleId}`);
}
export function setArticleLike(articleId: number) {
  return Post(urlPrefix, { articleId });
}
