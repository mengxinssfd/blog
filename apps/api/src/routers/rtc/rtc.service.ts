import { Injectable, NotFoundException } from '@nestjs/common';
import { AppRedisService } from '@/modules/redis/redis.service';
import { CreateRtcDto } from '@blog/dtos';

@Injectable()
export class RtcService {
  constructor(private readonly redisService: AppRedisService) {}
  async createOfferDesc(dto: CreateRtcDto) {
    // const find = await this.redisService.getRTC(dto.token);
    // if (find) throw new ForbiddenException(`Token ${dto.token} already exists`);
    return this.redisService.setRTC(dto);
  }
  async findOffer(token: string) {
    const offer = await this.redisService.getRTC(token);
    if (!offer) throw new NotFoundException(`Token ${token} offer not found`);
    return offer;
  }

  createAnswer(createFileExpressDto: CreateRtcDto) {
    return this.redisService.setRTC(createFileExpressDto, 'answer');
  }
  async findAnswer(token: string) {
    const answer = await this.redisService.getRTC(token, 'answer');
    if (!answer) throw new NotFoundException(`Token ${token} answer not found`);
    return answer;
  }
}
