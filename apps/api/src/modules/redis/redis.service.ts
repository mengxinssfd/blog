import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { UserEntity } from '@blog/entities';
import { getTimePeriodConst, dateAdd } from '@tool-pack/basic';
import { Logger } from '@/utils/log4js';
import type { CreateRtcDto } from '@blog/dtos';

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

  setRTC({ token, candidates, description }: CreateRtcDto, type: 'offer' | 'answer' = 'offer') {
    // 5 分钟后过期
    const now = new Date();
    const end = dateAdd(now, { minutes: 5 });
    const seconds = ~~((end.getTime() - now.getTime()) / 1000);
    Logger.info(`保存 WebRTC ${type} token(${token}) seconds(${seconds}) :`, candidates);
    return this.redis.set(
      `rtc:${type}:${token}`,
      JSON.stringify({ candidates, description }),
      'EX',
      seconds,
    );
  }
  getRTC(token: string, type: 'offer' | 'answer' = 'offer') {
    return this.redis.get(`rtc:${type}:${token}`);
  }
}
