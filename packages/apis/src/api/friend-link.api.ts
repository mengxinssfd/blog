import { methodsWithUrl } from '../request';
import type { FriendLinkEntity } from '@blog/entities';
import type { PageVo } from '@blog/dtos/src/page.vo';
import type {
  AdjudgeFriendLinkDto,
  CreateFriendLinkDto,
  FindAllFriendLinkDto,
  UpdateFriendLinkDto,
} from '@blog/dtos';

const urlPrefix = '/api/friend-link';
const [Get, Post, Patch] = methodsWithUrl(['get', 'post', 'patch'] as const, urlPrefix);

export function getFriendLinkList(data: FindAllFriendLinkDto) {
  return Get<PageVo<FriendLinkEntity>>(``, data);
}

export function getResolveFriendLinkList() {
  return Get<PageVo<FriendLinkEntity>>(`/resolve`);
}

export function createFriendLink(data: CreateFriendLinkDto) {
  return Post('', data);
}
export function updateFriendLink(id: number, data: UpdateFriendLinkDto) {
  return Patch(`/${id}`, data);
}
export function refreshSiteInfo(id: number) {
  return Patch<FriendLinkEntity>(`/refresh/${id}`, undefined, { successMsg: '更新成功' });
}

export function adjudgeFriendLink(id: number, data: AdjudgeFriendLinkDto) {
  return Patch('/adjudge/' + id, data);
}
