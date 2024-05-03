import { methodsWithUrl } from '../request';
import type { CreateCommentDto } from '@blog/dtos';
import type { PageVo } from '@blog/dtos/src/page.vo';
import type { CommentEntity } from '@blog/entities';
import type { ID } from '../types';
import type { PageDto } from '@blog/dtos/src/page.dto';

const urlPrefix = '/api/comment';

const [Get, Post, Delete] = methodsWithUrl(['GET', 'POST', 'DELETE'] as const, urlPrefix);
export function createComment(data: CreateCommentDto) {
  return Post(``, data, { successMsg: '评论成功' });
}
export function getCommentByArticle(articleId: ID) {
  return Get<PageVo<CommentEntity>>(`/article/${articleId}`);
}
export function setLike(articleId: number) {
  return Post('', { articleId });
}
export function deleteCommentOne(id: ID) {
  return Delete(`/${id}`, undefined, { successMsg: '删除成功' });
}
export function hardDeleteCommentOne(id: ID) {
  return Delete(`/delete/${id}`, undefined, { successMsg: '删除成功' });
}

export function getReplyMeList(_: unknown, data: PageDto) {
  return Get<PageVo<CommentEntity>>(`/reply`, data, { cache: true });
}
export function getCommentList(data: PageDto) {
  return Get<PageVo<CommentEntity>>('', data);
}
export function getCommentListByScope(scope: string) {
  return Get<PageVo<CommentEntity>>('/scope/' + encodeURIComponent(scope));
}

export function getRecentComment(count = 6) {
  return Get<CommentEntity[]>(`/recent/${count}`, undefined, { cache: false });
}
