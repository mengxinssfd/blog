import { howLongAgo as HowLongAgo, formatDate, inRange } from '@tool-pack/basic';
import { TupleM2N } from '@tool-pack/types';

export const howLongAgo = (date: string | Date, format?: string) => {
  const _date = typeof date === 'string' ? new Date(date) : date;
  return HowLongAgo(_date, {
    defaultFormat: format,
    def: '--',
    templates: {
      season: '~~',
      year: '~~',
    },
    filter(res, diff): string {
      if (inRange(diff, [0, 1000 * 10])) return '刚刚';
      if (res.endsWith('天前')) return { 1: '昨天', 2: '前天' }[res.replace('天前', '')] || res;
      if (res.endsWith('月前')) return formatDate(_date);
      return res;
    },
  });
};

const osMatches = {
  Android: '安卓',
  Windows: 'win',
};

export function filterOs(os: string | null): string {
  if (!os) return '';
  const split = os.split(/[|\s]/) as TupleM2N<string, 2, 3>;

  const platform = split[0];

  const tuple = [osMatches[platform as keyof typeof osMatches] || platform, split.at(-1)];

  return [...new Set(tuple)].join(' ');
}

const browserMatches = {
  'Microsoft Edge': 'Edge',
};

export function filterBrowser(browser: string | null): string {
  if (!browser) return '';
  const split = browser.split(/[|\s]/) as [string, string];

  const platform = split[0];

  const tuple = [
    browserMatches[platform as keyof typeof browserMatches] || platform,
    split.at(-1)!.split('.')[0],
  ];

  return [...new Set(tuple)].join(' ');
}
