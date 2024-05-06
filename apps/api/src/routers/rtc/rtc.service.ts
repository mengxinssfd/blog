import { Injectable } from '@nestjs/common';
import { AppRedisService } from '@/modules/redis/redis.service';
import { CreateRtcDto } from '@blog/dtos';

@Injectable()
export class RtcService {
  constructor(private readonly redisService: AppRedisService) {}
  create(createFileExpressDto: CreateRtcDto) {
    return this.redisService.setRTCCandidate(createFileExpressDto);
  }

  findOne(token: string) {
    return this.redisService.getRTCCandidate(token);
  }
}
