import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { RtcService } from './rtc.service';
import { ThrottlerBehindProxyGuard } from '@/guards/throttler-behind-proxy.guard';
import { Throttle } from '@nestjs/throttler';
import { CreateRtcDto } from '@blog/dtos';

@Controller('rtc')
export class RtcController {
  constructor(private readonly fileExpressService: RtcService) {}

  @UseGuards(ThrottlerBehindProxyGuard)
  // 可以在 60s 内向单个端点发出来自同一 IP 的 5 个请求
  @Throttle(5, 60)
  @Post()
  create(@Body() createFileExpressDto: CreateRtcDto) {
    return this.fileExpressService.create(createFileExpressDto);
  }

  @Get(':token')
  findOne(@Param('token') token: string) {
    return this.fileExpressService.findOne(token);
  }
}
