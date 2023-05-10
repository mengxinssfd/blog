import { useRequest } from '@request-template/vue3-hooks';
import type { ResType } from 'request-template';

export const SentenceCates: Record<string, string> = {
  a: '动画',
  b: '漫画',
  c: '游戏',
  d: '文学',
  e: '原创',
  f: '来自网络',
  g: '其他',
  h: '影视',
  i: '诗词',
  j: '网易云',
  k: '哲学',
  l: '抖机灵',
};

interface Res {
  commit_from: string;
  created_at: string;
  creator: string;
  creator_uid: number;
  from: string;
  from_who: null;
  hitokoto: string;
  id: number;
  length: number;
  reviewer: number;
  type: string;
  uuid: string;
}

export function useSentence() {
  async function getData(): Promise<ResType<Res>> {
    const response = await fetch('https://v1.hitokoto.cn');
    return { code: 200, data: await response.json(), msg: 'success' };
  }
  const { data, request } = useRequest(getData);

  onMounted(request);

  return { sentence: data };
}
