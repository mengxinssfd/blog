import { Get, Post, Delete } from '../request';
import { PageDto } from '@blog/dtos/dist/dtos/src/page.dto';
import { PageVo } from '@blog/dtos/dist/dtos/src/page.vo';
import type { FileEntity } from '@blog/entities';
import type { ID } from '../types';

export const uploadUrl = '/api/file';

export function uploadFile(file: File) {
  const fd = new FormData();
  fd.append('file', file);
  return Post(uploadUrl, fd);
}

export function deleteFile(id: ID) {
  return Delete(uploadUrl + '/' + id, undefined, { successMsg: '删除成功' });
}

export function getFileList(data?: PageDto) {
  return Get<PageVo<FileEntity>>(uploadUrl, data);
}
