import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { RtcService } from './rtc.service';
import { ThrottlerBehindProxyGuard } from '@/guards/throttler-behind-proxy.guard';
import { Throttle } from '@nestjs/throttler';
import { CreateRtcDto } from '@blog/dtos';

@Controller('rtc')
export class RtcController {
  constructor(private readonly rtcService: RtcService) {}

  @UseGuards(ThrottlerBehindProxyGuard)
  // 可以在 60s 内向单个端点发出来自同一 IP 的 5 个请求
  @Throttle(5, 60)
  @Post('offer')
  createOfferDesc(@Body() dto: CreateRtcDto) {
    return this.rtcService.createOfferDesc(dto);
  }

  @Get('offer/:token')
  findOffer(@Param('token') token: string) {
    return this.rtcService.findOffer(token);
  }

  @Post('answer')
  createAnswer(@Body() dto: CreateRtcDto) {
    return this.rtcService.createAnswer(dto);
  }
  @Get('answer/:token')
  getAnswer(@Param('token') token: string) {
    return this.rtcService.findAnswer(token);
  }
}
