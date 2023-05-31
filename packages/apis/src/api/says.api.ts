import { methodsWithUrl } from '../request';
import { PageVo } from '@blog/dtos/src/page.vo';
import type { SaysEntity } from '@blog/entities';
import { PageDto } from '@blog/dtos/src/page.dto';
import { ID } from '../types';
import type { CreateSaysDto, UpdateSaysDto } from '@blog/dtos';

const urlPrefix = '/api/says';

const [Get, Post, Delete, Patch] = methodsWithUrl(
  ['GET', 'POST', 'DELETE', 'PATCH'] as const,
  urlPrefix,
);
export function createSays(data: CreateSaysDto) {
  return Post(``, data, { successMsg: '新增说说成功' });
}
export function updateSays(id: ID, data: UpdateSaysDto) {
  return Patch(`/` + id, data, { successMsg: '更新说说成功' });
}
export function deleteSays(id: ID) {
  return Delete(`/${id}`, { successMsg: '说说删除成功' });
}

export function getSaysList(data?: PageDto) {
  return Get<PageVo<SaysEntity>>('', data);
}

export function getSaysListByAdmin(data?: PageDto) {
  return Get<PageVo<SaysEntity>>('/admin', data);
}
