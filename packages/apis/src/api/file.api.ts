import { Post } from '../request';

export const uploadUrl = '/api/file';

export function uploadFile(file: File) {
  const fd = new FormData();
  fd.append('file', file);
  return Post(uploadUrl, fd);
}
