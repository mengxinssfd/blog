import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from '@/utils/log4js';
import { formatResLog } from '@/utils/format-log';
import { shadowObj, castArray } from '@tool-pack/basic';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * 请求头响应全部改成200，body格式改为{code:number; msg:string; data?:string|object;}类型
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const body = exception.getResponse();

    const msg =
      status === 429
        ? '请求过于频繁'
        : typeof body === 'string'
        ? body
        : castArray(body['message']).join(';');
    const newJson = { code: status, msg };
    const data = exception.getResponse();

    if (typeof data === 'string') {
      if (data !== msg) Object.assign(newJson, { data });
    } else {
      if (data['data']) Object.assign(newJson, { data: data['data'] });
    }

    const logFormat = formatResLog(
      ctx.getRequest<Request>(),
      shadowObj(response, { statusCode: 200 }),
      newJson,
    );

    Logger.access(logFormat);
    Logger.info(logFormat);

    response.status(200).json(newJson);
  }
}
