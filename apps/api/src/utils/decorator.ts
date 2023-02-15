import { createParamDecorator } from '@nestjs/common';
import { IncomingMessage, ServerResponse } from 'http';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../modules/auth/constats';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { getIp } from './utils';

export const User = createParamDecorator((key: string, ctx: ExecutionContextHost) => {
  const sr: ServerResponse = ctx.switchToHttp().getResponse();
  const { req } = sr;
  if (!(req as any).user) {
    const auth = req.headers.authorization;
    const token = (auth || '').replace(/Bearer ?/, '');
    if (token) {
      const js = new JwtService({ secret: jwtConstants.secret });
      const payload: any = js.decode(token);
      if (payload && payload.exp > payload.iat) {
        (req as any).user = payload;
      }
    }
  }
  const user = (req as any).user ?? {};
  return key ? user[key] : user;
});

export const ReqIp = createParamDecorator((_data: unknown, ctx: ExecutionContextHost) => {
  const im = ctx.switchToHttp().getRequest<IncomingMessage>();
  // req.ip 或 req.socket.remoteAddress
  return getIp(im) // e2e测试时ip是'::ffff:127.0.0.1'，太长了
    .replace('::ffff:', '');
});

export const isFromWX = createParamDecorator((_data: unknown, ctx: ExecutionContextHost) => {
  const im = ctx.switchToHttp().getRequest<IncomingMessage>();
  const referer = im.headers.referer;
  return Boolean(referer?.startsWith('https://servicewechat.com'));
});
