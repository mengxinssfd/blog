import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
// import { Request } from 'express';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '@/guards/auth/public.decorator';
import { Reflector } from '@nestjs/core';
import { isPromiseLike } from '@tool-pack/basic';

/**
 * 全局解析token
 *
 * ~~必须要在guard之前，因为频率限制guard有用到user id~~
 * ~~好像可以直接用token做判断~~，token不行，因为token是还未验证过的，请求可以随意改token
 * 那么只能放中间件了，但是中间件解析了后JwtAuthGuard再解析会重复解析，需要把jwtAuthGuard的解析跳过，直接判断请求头是否有user
 *
 * 按照chatGPT的修改需要把JwtAuthGuard改为全局的，然后对不需要登录的接口添加Public装饰器，
 * 跟我所想的在全局中间件解析token，guard验证是否有user不太一样，不过都可以解决问题
 *
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  override canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const res = super.canActivate(context);

    const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler()) ?? true;
    // console.log('is public', isPublic);
    if (isPublic && isPromiseLike(res)) {
      return res.catch((e: unknown) => {
        if (e instanceof UnauthorizedException) return true;
        return Promise.reject(e);
      });
    }

    // console.log('JwtAuthGuard canActivate');
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    return res;
  }

  override handleRequest(err: any, user: any /*, info: any, context: ExecutionContext*/) {
    // const req = context.switchToHttp().getRequest<Request>();
    // eslint-disable-next-line prefer-rest-params
    // console.log('JwtAuthGuard handleRequest', req.path, err, info?.message);
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
