import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Logger } from '@/utils/log4js';
import { formatResLog } from '@/utils/format-log';
import type { IncomingMessage, ServerResponse } from 'http';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const arg1: ServerResponse = context.getArgByIndex(1);
    const req = arg1.req as IncomingMessage & {
      originalUrl: string;
      user: any;
    };

    // 若路由加了 @UseGuards(AuthGuard('jwt'))，则会把用户信息绑定在 req 上
    return next.handle().pipe(
      map((data) => {
        const result = { code: 200, msg: 'Success' };
        if (data) Object.assign(result, { data });
        const logFormat = formatResLog(req, arg1, result);
        Logger.access(logFormat);
        Logger.info(logFormat);
        return result;
      }),
    );
  }
}
