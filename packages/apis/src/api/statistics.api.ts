import { Get } from '../request';

const urlPrefix = '/api/statistics';

export interface StatisticsTotal {
  user: any;
  article: any;
  articleLike: any;
  comment: any;
}
export function getStatisticsTotal() {
  return Get<StatisticsTotal>(urlPrefix);
}
