import type { CommentEntity } from '@blog/entities';

export function getArticleLink(comment: CommentEntity): string {
  return comment.article.as ? `/${comment.article.as}` : '/article/detail/' + comment.articleId;
}
