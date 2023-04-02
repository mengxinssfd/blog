import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { isPromiseLike } from '@tool-pack/basic';

/**
 * 跟JwtAuthGuard功能类似，但不检查是否有传token，如果有传token则会转换user，用于代替User装饰器
 */
@Injectable()
export class FreeAuthGuard extends AuthGuard('jwt') {
  override canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const res = super.canActivate(context);

    if (isPromiseLike(res)) {
      return res.catch((e: unknown) => {
        if (e instanceof UnauthorizedException) return true;
        return Promise.reject(e);
      });
    }

    return true;
  }
}
