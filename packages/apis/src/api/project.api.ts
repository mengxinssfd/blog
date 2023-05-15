import { methodsWithUrl } from '../request';
import type { PageVo } from '@blog/dtos/src/page.vo';
import type { CreateProjectDto } from '@blog/dtos';
import type { ProjectEntity } from '@blog/entities';
import { UpdateProjectDto } from '@blog/dtos';

const urlPrefix = '/api/project';
const [Get, Post, Patch, Delete] = methodsWithUrl(
  ['get', 'post', 'patch', 'delete'] as const,
  urlPrefix,
);

export function getProjectList() {
  return Get<PageVo<ProjectEntity>>(``);
}

export function createProject(data: CreateProjectDto) {
  return Post('', data, { successMsg: '创建成功' });
}
export function updateProject(id: number, data: UpdateProjectDto) {
  return Patch(`/${id}`, data);
}
export function deleteProject(id: number) {
  return Delete(`/${id}`, undefined, { successMsg: '删除成功' });
}
