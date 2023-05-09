import { Injectable } from '@nestjs/common';
import IP2Region, { IP2RegionResult } from 'ip2region';
import type { Ipv4ToRegionRes } from 'ip2region/dist/lib/ipv4';

@Injectable()
export class Ip2RegionService {
  private query!: IP2Region;

  constructor() {
    this.query = new IP2Region({
      // ipv4db: '/tmp/db4.db', // 默认会引包内部的db
      // ipv6db: '/tmp/db6.db',
      disableIpv6: true,
    });
  }

  search(ip: string): IP2RegionResult | null {
    return this.query.search(ip);
  }

  searchRaw(ip: string, parse = true): ReturnType<typeof IP2Region.prototype.searchRaw> {
    return this.query.searchRaw(ip, parse);
  }

  searchRawRegion(ip: string): string | null {
    const res = this.searchRaw(ip, false) as Ipv4ToRegionRes | null;
    return res?.region || null;
  }
}
