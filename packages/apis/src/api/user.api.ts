import { methodsWithUrl } from '../request';
import type { ROLE, UserEntity } from '@blog/entities';
import type { PageVo } from '@blog/dtos/src/page.vo';
import type { LoginDTO, RegisterDTO, UpdatePasswordDto, UpdateUserDto } from '@blog/dtos';

const urlPrefix = '/api/user';
const [Get, Post, Patch, Delete] = methodsWithUrl(
  ['get', 'post', 'patch', 'delete'] as const,
  urlPrefix,
);

export function getSelfInfo() {
  return Get<{ user: UserEntity }>('/self', {}, { silent: true });
}
export function deleteUser(id: string | number) {
  return Delete('/' + id);
}
export function restoreUser(id: string | number) {
  return Patch('/restore/' + id);
}
export function getUserAll() {
  return Get<PageVo<UserEntity>>('');
}
export function getUserById(id: number | string) {
  return Get<UserEntity>('/' + id);
}
export function login(data: LoginDTO) {
  return Post<{ token: string }>('/login', data);
}
export function register(data: RegisterDTO) {
  return Post('/register', data);
}
export function updateUserInfo(userId: number | string, data: UpdateUserDto) {
  return Patch('/' + userId, data, { successMsg: '修改成功' });
}
export function updatePassword(userId: number | string, data: UpdatePasswordDto) {
  return Patch('/password/' + userId, data, { successMsg: '修改成功' });
}
export function muteUser(userId: number | string) {
  return Patch('/mute/' + userId);
}
export function cancelMuteUser(userId: number | string) {
  return Patch('/cancel-mute/' + userId);
}
export function setRole(userId: number | string, role: ROLE) {
  return Patch<{ role: ROLE }>('/role/' + userId, { role });
}
