import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from '../../utils/log4js';
import { formatResLog } from '../../utils/format-log';
import { shadowObj } from '@tool-pack/basic';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const msg = status === 429 ? '请求过于频繁' : exception.message;
    const newJson = { code: status, msg };

    const logFormat = formatResLog(
      shadowObj(ctx.getRequest<Request>(), { statusCode: 200 }),
      newJson,
    );

    Logger.access(logFormat);
    Logger.info(logFormat);

    response.status(200).json(newJson);
  }
}
