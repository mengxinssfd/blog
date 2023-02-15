import type { Request, Response } from 'express';
import { Logger } from '@/utils/log4js';
import { formatReqLog } from '@/utils/format-log';

// 函数式中间件
/**
 * 接口访问请求记录logs
 */
export function logger(req: Request, _res: Response, next: () => any) {
  const logFormat = formatReqLog(req);
  Logger.access(logFormat);
  Logger.info(logFormat);
  next();
}
