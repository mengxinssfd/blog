import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
// import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  override canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // console.log('JwtAuthGuard canActivate');
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    return super.canActivate(context);
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
