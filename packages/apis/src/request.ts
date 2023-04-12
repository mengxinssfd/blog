import type { Method } from 'axios';
import type { CustomConfig, DynamicCustomConfig, RequestTemplate } from 'request-template';
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

const factoryWrapper = (...args: Parameters<typeof _ins.simplifyMethodFactory>) => {
  return <T = never, RC extends boolean = false>(
    url: string,
    data = {},
    customConfig = {} as DynamicCustomConfig<PrimaryCustomConfig, RC>,
  ) => {
    return _ins.simplifyMethodFactory(...args)<T, RC>(url, data, customConfig);
  };
};

export function methodsWithUrl<T extends readonly Method[]>(
  methods: T,
  urlPrefix = '',
): Tuple<ReturnType<typeof factoryWrapper>, T['length']> {
  return methods.map((method) => factoryWrapper(method, urlPrefix)) as any;
}

export const [Get, Post, Patch, Delete] = methodsWithUrl([
  'GET',
  'POST',
  'PATCH',
  'DELETE',
] as const);
