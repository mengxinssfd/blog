import { methodsWithUrl } from '../request';
import type { USER_ROLE, UserEntity } from '@blog/entities';
import type { PageVo } from '@blog/dtos/src/page.vo';
import type {
  LoginDTO,
  RegisterDTO,
  UpdatePasswordDto,
  UpdateUserDto,
  AdminUpdateUserDto,
} from '@blog/dtos';
import type { CustomCacheConfig } from 'request-template';
import type { ID } from '../types';

const urlPrefix = '/api/user';
const [Get, Post, Patch, Delete] = methodsWithUrl(
  ['get', 'post', 'patch', 'delete'] as const,
  urlPrefix,
);

export function getSelfInfo(cache: CustomCacheConfig = {}) {
  return Get<{ user: UserEntity }>('/self', {}, { silent: true, cache });
}
export function deleteUser(id: ID) {
  return Delete('/' + id);
}
export function restoreUser(id: ID) {
  return Patch('/restore/' + id);
}
export function getUserAll() {
  return Get<PageVo<UserEntity>>('');
}
export function getUserById(id: ID) {
  return Get<UserEntity>('/' + id);
}
export function login(data: LoginDTO) {
  return Post<{ token: string }>('/login', data);
}
export function register(data: RegisterDTO) {
  return Post('/register', data);
}
export function updateUserInfo(userId: ID, data: UpdateUserDto) {
  return Patch('/' + userId, data, { successMsg: '修改成功' });
}
export function updateUserInfoByAdmin(userId: ID, data: AdminUpdateUserDto) {
  return Patch('/by-admin/' + userId, data, { successMsg: '修改成功' });
}
export function updatePassword(userId: ID, data: UpdatePasswordDto) {
  return Patch('/password/' + userId, data, { successMsg: '修改成功' });
}
export function setMute(userId: ID, mute: boolean) {
  return Patch('/mute/' + userId, { mute });
}
export function setRole(userId: ID, role: USER_ROLE) {
  return Patch<{ role: USER_ROLE }>('/role/' + userId, { role });
}
