import { Module } from '@nestjs/common';
import { RtcService } from './rtc.service';
import { RtcController } from './rtc.controller';

@Module({
  controllers: [RtcController],
  providers: [RtcService],
})
export class RtcModule {}
