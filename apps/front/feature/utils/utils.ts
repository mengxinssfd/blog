import { howLongAgo as HowLongAgo, formatDate, inRange } from '@tool-pack/basic';
import { TupleM2N } from '@tool-pack/types';

export const howLongAgo = (date: string | Date, format?: string) => {
  const _date = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  return HowLongAgo(_date, {
    defaultFormat: format,
    def: '--',
    templates: {
      season: '~~',
      year: '~~',
      month: '~~',
      week: '~~',
    },
    filter(res, diff): string {
      if (inRange(diff, [0, 1000 * 10])) return '刚刚';
      // if (res.endsWith('天前')) return { 1: '昨天', 2: '前天' }[res.replace('天前', '')] || res;
      if (res.endsWith('天前')) {
        const match = { '1天前': '昨天', '2天前': '前天' }[res];
        if (match) return match + formatDate(_date, ' hh:mm');
        return formatDate(
          _date,
          now.getFullYear() === _date.getFullYear() ? 'MM-dd hh:mm:ss' : undefined,
        );
      }
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
  let _browser = browser || '';
  if (!_browser) return '';

  Object.entries(browserMatches).forEach(([k, v]) => {
    _browser = _browser.replace(k, v);
  });

  const [platform, version] = _browser.split(/[|\s]/) as [string, string];

  const tuple = [
    browserMatches[platform as keyof typeof browserMatches] || platform,
    version.split('.')[0],
  ];

  return [...new Set(tuple)].join(' ');
}
