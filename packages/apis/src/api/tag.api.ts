import { Get, Post } from '../request';
import type { TagEntity } from '@blog/entities';
import type { CreateTagDto } from '@blog/dtos';

const urlPrefix = '/api/tag';

export function createTag(data: CreateTagDto) {
  return Post(urlPrefix, data);
}

export function getTags() {
  return Get<TagEntity[]>(urlPrefix);
}
