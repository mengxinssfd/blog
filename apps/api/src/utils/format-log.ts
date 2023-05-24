import type { Request, Response } from 'express';
import type { IncomingMessage } from 'http';
import { ServerResponse } from 'http';
import { getIp } from '@/utils/utils';
import { Ip2RegionService } from '@/modules/ip2region/ip2region.service';

const ip2Region = new Ip2RegionService();
export function formatReqLog(req: Request): string {
  const ip = getIp(req);
  // 组装日志信息
  return ` >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    Request original url: ${req.originalUrl}
    Method: ${req.method}
    IP: ${ip}
    region: ${ip2Region.searchRawRegion(ip)}
    uuid: ${req.headers['uuid']}
    refer: ${req.headers.referer}
    Params: ${JSON.stringify(req.params)}
    Query: ${JSON.stringify(req.query)}
    Body: ${JSON.stringify(req.body)} 
  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  `;
}

export function formatResLog(
  req:
    | Request
    | (IncomingMessage & {
        originalUrl?: string;
        user?: any;
      }),
  res: Response | ServerResponse,
  data: any,
): string {
  const ip = getIp(req);
  return ` <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    Request original url: ${req.originalUrl}
    Method: ${req.method}
    IP: ${ip}
    region: ${ip2Region.searchRawRegion(ip)}
    Status code: ${res.statusCode}
    User: ${JSON.stringify((req as any).user)}
    Response: ${JSON.stringify(data)}
  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`;
}
