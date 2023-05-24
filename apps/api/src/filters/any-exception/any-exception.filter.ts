import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from '@/utils/log4js';
import { formatReqLog, formatResLog } from '@/utils/format-log';
import { shadowObj } from '@tool-pack/basic';

@Catch()
export class AnyExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const body = { code: statusCode, msg: exception.message };

    const req = shadowObj(ctx.getRequest<Request>(), { statusCode });
    Logger.error(
      JSON.stringify(req.headers, null, 4),
      '\n',
      formatReqLog(req).trimEnd(),
      '\n',
      formatResLog(req, response, body),
      '\n',
      exception,
      '\n',
    );

    response.status(statusCode).json(body);
  }
}
