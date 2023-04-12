import { methodsWithUrl } from '@blog/apis';

const urlPrefix = '/api/article-like';

const [Get, Patch] = methodsWithUrl(['GET', 'PATCH'] as const, urlPrefix);

export function getArticleLikeCount(articleId: number) {
  return Get(`/count/${articleId}`);
}
export function setArticleLike(articleId: number) {
  return Patch(`/${articleId}`, { articleId });
}
