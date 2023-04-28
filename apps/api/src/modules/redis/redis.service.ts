import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { UserEntity } from '@blog/entities';
import { getTimePeriodConst } from '@tool-pack/basic';
import { Logger } from '@/utils/log4js';

type BaseUser = Pick<UserEntity, 'id'>;

@Injectable()
export class AppRedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  private getTokenKeyName(user: BaseUser): string {
    return 'tokens:' + user.id;
  }

  getToken(user: BaseUser): Promise<string | null> {
    return this.redis.get(this.getTokenKeyName(user));
  }

  setToken(token: string, user: BaseUser): Promise<'OK'> {
    return this.redis.set(this.getTokenKeyName(user), token, 'EX', getTimePeriodConst().day / 1000);
  }

  delToken(user: BaseUser): Promise<number> {
    return this.redis.del(this.getTokenKeyName(user));
  }

  getTokens() {
    return this.redis.keys('tokens:*');
  }

  setDailyImg(imgList: string) {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const seconds = ~~((tomorrow.getTime() - now.getTime()) / 1000);
    Logger.info('保存每日Bing图', seconds, imgList);
    return this.redis.set('dailyImg', imgList, 'EX', seconds);
  }
  getDailyImg() {
    return this.redis.get('dailyImg');
  }
}
