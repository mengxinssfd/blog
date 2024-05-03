import { methodsWithUrl } from '../request';
import type { ArticleEntity } from '@blog/entities';
import type { ArticleListDto, CreateArticleDto, UpdateArticleDto } from '@blog/dtos';
import type { ID } from '../types';
import type { PageDto } from '@blog/dtos/src/page.dto';
import type { PageVo } from '@blog/dtos/src/page.vo';
import type { CustomCacheConfig } from 'request-template';
import type { ArticleSetAsDto } from '@blog/dtos';

export type GetArticleListRes = PageVo<ArticleEntity>;

const urlPrefix = '/api/article';
const [Get, Post, Patch, Delete] = methodsWithUrl(
  ['get', 'post', 'patch', 'delete'] as const,
  urlPrefix,
);

export function createArticle(data: CreateArticleDto) {
  return Post<{ id: number }>('', data, { showSuccessMsg: true, successMsg: '添加成功' });
}
export function deleteArticle(articleId: ID) {
  return Delete(`/${articleId}`, undefined, { successMsg: '删除成功' });
}
export function restoreArticle(articleId: ID) {
  return Patch(`/restore/${articleId}`, {}, { successMsg: '恢复成功' });
}
export function updateArticle(articleId: number | string, data: UpdateArticleDto) {
  return Patch(`/${articleId}`, data, { showSuccessMsg: true, successMsg: '更新成功' });
}

export function getArticleList(data: ArticleListDto, cache: CustomCacheConfig | boolean = true) {
  return Get<GetArticleListRes>('', data, { cache });
}
export function getAllArticleList(data: ArticleListDto, cache: CustomCacheConfig | boolean = true) {
  return Get<GetArticleListRes>('/all', data, { cache });
}
export function getArticleListByAuthor(authorId: number, data: {}) {
  return Get<GetArticleListRes>(`/author/${authorId}`, data, {
    cache: true,
  });
}
export function getArticleListByLikeUser(userId: number, data: {}) {
  return Get<GetArticleListRes>(`/like-user/${userId}`, data, {
    cache: true,
  });
}
export function getArticleListByCommentUser(userId: number, data: PageDto) {
  return Get<GetArticleListRes>(`/comment-user/${userId}`, data, { cache: true });
}
export function getArticleDetail(articleId: ID) {
  return Get<ArticleEntity>('/' + articleId);
}

export function getRawArticleDetail(articleId: ID) {
  return Get<ArticleEntity>('/raw/' + articleId);
}
export function setArticleCommentLock(articleId: ID) {
  return Post('/mute/' + articleId);
}
export function setArticleAs(id: ID, dto: ArticleSetAsDto) {
  return Patch('/as/' + id, dto, { successMsg: '设置成功' });
}
export function getArticleAs(as: string) {
  return Get<ArticleEntity>(`/as/${encodeURIComponent(as)}`);
}
