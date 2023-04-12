import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
// import { Request } from 'express';
import { Observable } from 'rxjs';
import { IS_PUBLIC_AUTH_KEY } from '@/guards/auth/auth.decorator';
import { Reflector } from '@nestjs/core';
import { isPromiseLike } from '@tool-pack/basic';
import { Request } from 'express';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import type { UserEntity } from '@blog/entities';

type JwtUser = Pick<UserEntity, 'id' | 'role'>;

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
  constructor(private reflector: Reflector, @InjectRedis() private readonly redis: Redis) {
    super();
    console.log(this.redis.get('1'));
  }

  override canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const res = super.canActivate(context);

    const isPublic = this.isPublic(context);

    if (isPromiseLike(res) && !isPublic) {
      return res.then(async (res) => {
        const user = request['user'] as JwtUser;
        if (!user) return res;

        const token = await this.redis.get('UserToken_' + user.id);
        if (token && token === this.extractTokenFromHeader(request)) return true;

        request['user'] = undefined;
        return false;
      });
    }

    // console.log('JwtAuthGuard canActivate');
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    return res;
  }

  override handleRequest<T = JwtUser>(
    err: any,
    user: T | false,
    _info: any,
    context: ExecutionContext,
  ): T | void {
    if (this.isPublic(context)) return;
    if (err || !user) throw err || new UnauthorizedException();
    return user;
  }

  private isPublic(context: ExecutionContext) {
    return this.reflector.get<boolean>(IS_PUBLIC_AUTH_KEY, context.getHandler()) ?? true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
