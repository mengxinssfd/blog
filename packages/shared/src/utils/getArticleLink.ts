import type { CommentEntity } from '@blog/entities';

export function getArticleLink(comment: CommentEntity): string {
  console.log(comment);
  if (comment.scope) return '/' + comment.scope;
  return comment.article.as ? `/${comment.article.as}` : '/article/detail/' + comment.articleId;
}
