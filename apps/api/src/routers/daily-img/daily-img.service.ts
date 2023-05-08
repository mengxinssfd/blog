import { Injectable } from '@nestjs/common';
import { AppRedisService } from '@/modules/redis/redis.service';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class DailyImgService {
  constructor(
    private readonly redisService: AppRedisService,
    private readonly httpService: HttpService,
  ) {}
  async findOne() {
    const redisDailyImg = await this.redisService.getDailyImg();
    if (redisDailyImg) return JSON.parse(redisDailyImg);

    const { data: dailyImg } = await this.httpService.axiosRef.get(
      'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=7',
    );

    this.redisService.setDailyImg(JSON.stringify(dailyImg));

    return dailyImg;
  }
}
