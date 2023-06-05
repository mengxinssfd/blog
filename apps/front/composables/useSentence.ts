import { useRequest } from '@request-template/vue3-hooks';
import { PrimaryRequest } from '~/feature/request/primary';
import { ResType } from 'request-template';

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
  _: '其他',
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
  function getData(): Promise<ResType<Res>> {
    return PrimaryRequest.ins.request(
      {
        url: 'https://v1.hitokoto.cn',
        transformResponse: (r) => {
          try {
            return { code: 200, data: JSON.parse(r), msg: 'success' };
          } catch (e) {
            return { code: 0, msg: '一言获取失败' };
          }
        },
      },
      { cache: { enable: true, timeout: 1000 * 60 * 5 } },
    );
  }
  const { data, request } = useRequest(getData);

  onMounted(request);

  return { sentence: data };
}
