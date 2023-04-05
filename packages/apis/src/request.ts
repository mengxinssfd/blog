import type { Method } from 'axios';
import type { CustomConfig, RequestTemplate } from 'request-template';
import { Tuple } from '@tool-pack/types';

export interface PrimaryCustomConfig extends CustomConfig {
  showSuccessMsg?: boolean;
  successMsg?: string;
}

let _ins: RequestTemplate<PrimaryCustomConfig>;

export function setRequestIns(ins: RequestTemplate) {
  _ins = ins;
}

export function getRequestIns() {
  return _ins;
}

export function methodsWithUrl<T extends readonly Method[]>(
  methods: T,
  urlPrefix = '',
): Tuple<ReturnType<typeof _ins.simplifyMethodFactory>, T['length']> {
  return methods.map((method) => _ins.simplifyMethodFactory(method, urlPrefix)) as any;
}

export const [Get, Post, Patch, Delete] = methodsWithUrl([
  'GET',
  'POST',
  'PATCH',
  'DELETE',
] as const);
