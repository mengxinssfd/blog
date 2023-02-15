import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';
import { IncomingMessage } from 'http';
import { getIp } from '@/utils/utils';
import { UserEntity } from '@blog/entities';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected override getTracker(
    req: IncomingMessage & { ips: string[]; ip: string; user?: UserEntity },
  ): string {
    const ip = getIp(req);
    console.log('ThrottlerBehindProxyGuard', req.ips, ip, req.user);
    return req.user?.id.toString() ?? (req.ips.join('|') || ip); // individualize IP extraction to meet your own needs
  }
}
