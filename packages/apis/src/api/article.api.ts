import { methodsWithUrl } from '../request';
import type { ArticleEntity } from '@blog/entities';
import type { ArticleListDto, CreateArticleDto, UpdateArticleDto } from '@blog/dtos';
import { ID } from '../types';
import { PageDto } from '@blog/dtos/src/page.dto';
import { PageVo } from '@blog/dtos/src/page.vo';

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
  return Delete(`/${articleId}`);
}
export function restoreArticle(articleId: ID) {
  return Patch(`/restore/${articleId}`, {}, { successMsg: '恢复成功' });
}
export function updateArticle(articleId: number | string, data: UpdateArticleDto) {
  return Patch(`/${articleId}`, data, { showSuccessMsg: true, successMsg: '更新成功' });
}

export function getArticleList(data: ArticleListDto, cache = true) {
  return Get<GetArticleListRes>('', data, { cache });
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
export function getAbout() {
  return Get<ArticleEntity>('/about');
}

export function getRawArticleDetail(articleId: ID) {
  return Get<ArticleEntity>('/raw/' + articleId);
}
export function setArticleCommentLock(articleId: ID) {
  return Post('/mute/' + articleId);
}
