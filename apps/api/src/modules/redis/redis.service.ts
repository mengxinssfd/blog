import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { UserEntity } from '@blog/entities';
import { getTimePeriodConst } from '@tool-pack/basic';

type BaseUser = Pick<UserEntity, 'id'>;

@Injectable()
export class AppRedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  private getTokenKeyName(user: BaseUser): string {
    return 'UserToken_' + user.id;
  }

  getToken(user: BaseUser): Promise<string | null> {
    return this.redis.get(this.getTokenKeyName(user));
  }

  setToken(token: string, user: BaseUser): Promise<'OK'> {
    return this.redis.set(this.getTokenKeyName(user), token, 'EX', getTimePeriodConst().day / 1000);
  }
}
