import { methodsWithUrl } from '../request';
import type { FriendLinkEntity } from '@blog/entities';
import type { PageVo } from '@blog/dtos/src/page.vo';
import type {
  AdjudgeFriendLinkDto,
  CreateFriendLinkDto,
  FindAllFriendLinkDto,
  UpdateFriendLinkDto,
} from '@blog/dtos';
import type { PageDto } from '@blog/dtos/src/page.dto';
import type { ActiveFriendLinkDto } from '@blog/dtos';
import type { CustomCacheConfig } from 'request-template';

const urlPrefix = '/api/friend-link';
const [Get, Post, Patch, Delete] = methodsWithUrl(
  ['get', 'post', 'patch', 'delete'] as const,
  urlPrefix,
);

export function getFriendLinkList(data: FindAllFriendLinkDto) {
  return Get<PageVo<FriendLinkEntity>>(``, data);
}

export function getResolveFriendLinkList(
  active = true,
  cache: CustomCacheConfig | boolean = false,
) {
  return Get<PageVo<FriendLinkEntity>>(`/resolve/active/${active}`, undefined, { cache });
}

export function createFriendLink(data: CreateFriendLinkDto) {
  return Post('', data);
}
export function updateFriendLink(id: number, data: UpdateFriendLinkDto) {
  return Patch(`/${id}`, data);
}
export function deleteFriendLink(id: number) {
  return Delete(`/${id}`, undefined, { successMsg: '删除成功' });
}
export function refreshSiteInfo(id: number) {
  return Patch<FriendLinkEntity>(`/refresh/${id}`, undefined, { successMsg: '更新成功' });
}

export function adjudgeFriendLink(id: number, data: AdjudgeFriendLinkDto) {
  return Patch('/adjudge/' + id, data, { successMsg: '设置成功' });
}
export function setFriendLinkActive(id: number, data: ActiveFriendLinkDto) {
  return Patch('/active/' + id, data, { successMsg: '设置成功' });
}

export function getRecentResolveFriendLink(dto: PageDto = { page: 1, pageSize: 5 }) {
  return Get<PageVo<FriendLinkEntity>>('/resolve/recent', dto);
}

export function getApplyFriendLinkList(dto: PageDto = { page: 1, pageSize: 5 }) {
  return Get<PageVo<FriendLinkEntity>>('/apply', dto);
}
