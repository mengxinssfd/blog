import { getMilliseconds } from '@tool-pack/basic';
import { Get } from '../request';

export interface DailyImg {
  title: string;
  url: string;
  copyright: string;
  urlbase: string;
}
export function getDailyImg() {
  return Get<{ images: DailyImg[] }>(
    '/api/daily-img',
    {},
    { cache: { timeout: getMilliseconds({ hours: 0.5 }) } },
  );
}
