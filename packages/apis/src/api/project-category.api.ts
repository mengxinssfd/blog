import { methodsWithUrl } from '../request';
import type {
  CreateProjectCategoryDto,
  ListProjectCategoryDto,
  UpdateProjectCategoryDto,
} from '@blog/dtos';
import type { ProjectCategoryEntity } from '@blog/entities';
import type { ID } from '../types';
import type { PageVo } from '@blog/dtos/src/page.vo';
import type { PageDto } from '@blog/dtos/src/page.dto';

const urlPrefix = '/api/project-category';

const [Get, Post, Patch, Delete] = methodsWithUrl(
  ['get', 'post', 'patch', 'delete'] as const,
  urlPrefix,
);

export function createProjectCategory(data: CreateProjectCategoryDto) {
  return Post('', data, { successMsg: '新增成功' });
}
export function getProjectCategoryList(dto?: ListProjectCategoryDto) {
  return Get<PageVo<ProjectCategoryEntity>>('', dto);
}
export function getProjectCategoryListByAdmin(dto?: PageDto) {
  return Get<PageVo<ProjectCategoryEntity>>('/admin', dto);
}

export function updateProjectCategory(id: ID, dto: UpdateProjectCategoryDto) {
  return Patch('/' + id, dto, { successMsg: '修改成功' });
}
export function deleteProjectCategory(id: ID) {
  return Delete('/' + id, undefined, { successMsg: '修改成功' });
}
export function restoreProjectCategory(id: ID) {
  return Patch('/restore/' + id, undefined, { successMsg: '恢复成功' });
}
