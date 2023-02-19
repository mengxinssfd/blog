import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from '@/utils/log4js';
import { formatResLog } from '@/utils/format-log';
import { shadowObj } from '@tool-pack/basic';
import { ForbiddenError } from '@casl/ability';

@Catch(ForbiddenError)
export class CaslForbiddenErrorExceptionFilter implements ExceptionFilter {
  /**
   * 请求头响应全部改成200，body格式改为{code:number; msg:string; data?:string|object;}类型
   */
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const msg = exception.message;
    const newJson = { code: response.statusCode, msg };

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
