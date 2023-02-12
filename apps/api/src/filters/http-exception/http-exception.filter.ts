import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from '../../utils/log4js';
import { formatResLog } from '../../utils/format-log';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const msg = status === 429 ? '请求过于频繁' : exception.message;
    const newJson = { code: status, msg };

    const req: Request = Object.create(ctx.getRequest());
    req.statusCode = 200;
    const logFormat = formatResLog(req, newJson);
    Logger.access(logFormat);
    Logger.info(logFormat);

    response.status(200).json(newJson);
  }
}
