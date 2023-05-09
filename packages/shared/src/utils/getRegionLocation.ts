import type { Tuple } from '@tool-pack/types';

export function getRegionLocation(addr: string | null): string {
  if (!addr || addr === '0|0|0|内网IP|内网IP') return '--';

  // 中国|0|广东省|广州市|移动
  const [
    /** 国家 */
    country,
    ,
    /** 省份 */
    province,
    /** 城市 */
    city,
    /** ISP 供应商 */
    // isp,
  ] = addr.split('|') as Tuple<string, 5>;

  const pc = [
    ...new Set([province, city].filter((i) => i !== '0').map((i) => i.replace(/[省市]/, ''))),
  ].join('-');
  if (pc) return pc;
  return country;
}
