import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from '@/utils/log4js';
import { formatResLog } from '@/utils/format-log';
import { shadowObj } from '@tool-pack/basic';

@Catch()
export class AnyExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const body = { code: statusCode, msg: `Service Error: ${exception}` };

    const req = shadowObj(ctx.getRequest<Request>(), { statusCode });
    Logger.error(formatResLog(req, response, body));

    response.status(statusCode).json(body);
  }
}
