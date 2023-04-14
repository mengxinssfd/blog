import { Injectable } from '@nestjs/common';
import { httpsGet } from '@/utils/utils';
import { AppRedisService } from '@/modules/redis/redis.service';

@Injectable()
export class DailyImgService {
  constructor(private readonly redisService: AppRedisService) {}
  async findOne() {
    const redisDailyImg = await this.redisService.getDailyImg();
    if (redisDailyImg) return JSON.parse(redisDailyImg);

    const dailyImg = await httpsGet('https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=7');
    this.redisService.setDailyImg(JSON.stringify(dailyImg));

    return dailyImg;
  }
}
