import { howLongAgo as HowLongAgo, formatDate, inRange } from '@tool-pack/basic';

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
