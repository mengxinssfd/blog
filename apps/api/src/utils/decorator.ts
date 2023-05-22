import { createParamDecorator } from '@nestjs/common';
import { IncomingMessage, ServerResponse } from 'http';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '@/modules/auth/constats';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { getIp } from './utils';
import * as Bowser from 'bowser';

export const User = createParamDecorator(
  (key: 'id' | 'username' | 'role', ctx: ExecutionContextHost) => {
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
  },
);

export const ReqIp = createParamDecorator((_data: unknown, ctx: ExecutionContextHost) => {
  const im = ctx.switchToHttp().getRequest<IncomingMessage>();
  // req.ip 或 req.socket.remoteAddress
  return getIp(im) // e2e测试时ip是'::ffff:127.0.0.1'，太长了
    .replace('::ffff:', '');
});

export const IsFromWX = createParamDecorator((_data: unknown, ctx: ExecutionContextHost) => {
  const im = ctx.switchToHttp().getRequest<IncomingMessage>();
  const referer = im.headers.referer;
  return Boolean(referer?.startsWith('https://servicewechat.com'));
});

export const Device = createParamDecorator((_data: unknown, ctx: ExecutionContextHost) => {
  const sr: ServerResponse = ctx.switchToHttp().getResponse();
  const { req } = sr;
  const p = Bowser.parse(req.headers['user-agent'] || 'default');
  const { browser, os } = p;

  function handler(v: string): string {
    return (
      v
        .trim()
        // 把前面的'|'后面的'|'中间的多个'|'清理掉
        .replace(/^\|+|\|*(\|[^$])|\|+$/g, '$1')
        .slice(0, 50)
    );
  }
  return {
    browser: handler(`${browser.name || ''}|${browser.version || ''}`),
    os: handler(`${os.name || ''}|${os.version || ''}|${os.versionName || ''}`),
  };
});
