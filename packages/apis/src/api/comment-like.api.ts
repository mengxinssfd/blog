import { Get, Post } from '../request';

const urlPrefix = '/api/comment-like';

export function getCommentLikeCount(articleId: number) {
  return Get<number>(`${urlPrefix}/count/${articleId}`);
}
export function setCommentLike(commentId: number) {
  return Post(`${urlPrefix}/${commentId}`);
}
