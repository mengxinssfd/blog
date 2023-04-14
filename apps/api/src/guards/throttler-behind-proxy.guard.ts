import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';
import { IncomingMessage } from 'http';
import { getIp } from '@/utils/utils';
import { UserEntity } from '@blog/entities';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  override errorMessage = '请求过于频繁';
  protected override getTracker(
    req: IncomingMessage & { ips: string[]; ip: string; user?: UserEntity },
  ): string {
    return req.user?.id.toString() ?? (req.ips.join('|') || getIp(req)); // individualize IP extraction to meet your own needs
  }

  // protected override generateKey(context: ExecutionContext, tracker: string): string {
  //   const req = context.switchToHttp().getRequest<Request>();
  //   const user = req.user as Pick<UserEntity, 'id' | 'role'> | undefined;
  //   return super.generateKey(context, user?.id.toString() || tracker);
  // }
}
