import { Get, Post } from '../request';
import type { CategoryEntity } from '@blog/entities';

const urlPrefix = '/api/category';

export function createCategory(data: {}) {
  return Post(`${urlPrefix}`, data);
}
export function getCategoryList() {
  return Get<CategoryEntity[]>(urlPrefix);
}
