import { howLongAgo as HowLongAgo, formatDate } from '@tool-pack/basic';

export const howLongAgo = (date: string | Date, format?: string) => {
  const _date = typeof date === 'string' ? new Date(date) : date;
  return HowLongAgo(_date, {
    now: new Date(),
    defaultFormat: format,
    def: '--',
    templates: {
      second: '刚刚',
      season: '~~',
      year: '~~',
    },
    filter(res) {
      if (res.endsWith('月前')) return formatDate(_date);
      return res;
    },
  });
};
