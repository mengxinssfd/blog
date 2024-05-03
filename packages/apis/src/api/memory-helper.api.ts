import type { ID } from '../types';
import { methodsWithUrl } from '@blog/apis';
import type { MemoryHelperEntity } from '@blog/entities';
import type { PageVo } from '@blog/dtos/dist/dtos/src/page.vo';
import type { CreateMemoryHelperDto, MemoryListDTO, UpdateMemoryHelperDto } from '@blog/dtos';
import type { MemoryHelperEntityResolved } from '@blog/entities';

const urlPrefix = '/api/memory-helper';

const [Get, Post, Patch, Delete] = methodsWithUrl(
  ['get', 'post', 'patch', 'delete'] as const,
  urlPrefix,
);

export function createMemory(data: CreateMemoryHelperDto) {
  return Post('', data, { showSuccessMsg: true, successMsg: '新增成功' });
}

export function updateMemory(id: ID, data: UpdateMemoryHelperDto) {
  return Patch(`/${id}`, data, { showSuccessMsg: true, successMsg: '修改成功' });
}

export function deleteMemory(id: ID) {
  return Delete(`/${id}`, {}, { showSuccessMsg: true, successMsg: '删除成功' });
}

export function getMemory(id: ID) {
  return Get<MemoryHelperEntityResolved>(`/${id}`, {}, { loading: true }).then((res) => {
    res.data.questionList = JSON.parse(res.data.questionJson);
    return res;
  });
}

export function getMemoryList(data: MemoryListDTO = {}) {
  return Get<PageVo<MemoryHelperEntity>>('', data);
}
