import { Get, Post } from '../request';

const urlPrefix = '/api/comment-dislike';

export function getCommentDislikeCount(articleId: number) {
  return Get<number>(`${urlPrefix}/count/${articleId}`);
}
export function setCommentDislike(commentId: number) {
  return Post(urlPrefix, { commentId });
}
