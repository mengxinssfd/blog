import { methodsWithUrl } from '../request';
import type { CreateCommentDto } from '@blog/dtos';
import { PageVo } from '@blog/dtos/src/page.vo';
import type { CommentEntity } from '@blog/entities';
import { PageDto } from '@blog/dtos/src/page.dto';

const urlPrefix = '/api/comment-says';

const [Get, Post] = methodsWithUrl(['GET', 'POST'] as const, urlPrefix);
export function createSays(data: CreateCommentDto) {
  return Post(``, data, { successMsg: '新增说说成功' });
}

export function getSaysList(data?: PageDto) {
  return Get<PageVo<CommentEntity>>('', data);
}
