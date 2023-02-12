import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from '../../utils/log4js';
import { formatResLog } from '../../utils/format-log';

@Catch()
export class AnyExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const result = { code: statusCode, msg: `Service Error: ${exception}` };

    const res: Response = Object.create(response);
    res.statusCode = statusCode;
    Logger.error(formatResLog(request, result));

    response.status(statusCode).json(result);
  }
}
