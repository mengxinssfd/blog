import type { Request } from 'express';
import type { IncomingMessage } from 'http';

export function formatReqLog(req: Request): string {
  // 组装日志信息
  return ` >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    Request original url: ${req.originalUrl}
    Method: ${req.method}
    IP: ${req.ip}
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
  data: any,
): string {
  return `   <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    Request original url: ${req.originalUrl}
    Method: ${req.method}
    Status code: ${req.statusCode}
    User: ${JSON.stringify((req as any).user)}
    Response: ${JSON.stringify(data)}
    <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`;
}
