import { CommentEntity } from '@blog/entities';
import { getArticleLink } from './getArticleLink';

export function getArticleCommentLink(comment: CommentEntity): string {
  const path = getArticleLink(comment);
  const anchor = (comment.article.as === 'says' ? '_says-' : '_comment-') + comment.id;
  return `${path}#${anchor}`;
}
