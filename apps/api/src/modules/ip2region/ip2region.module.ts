import { Module } from '@nestjs/common';
import { Ip2RegionService } from './ip2region.service';

@Module({
  providers: [Ip2RegionService],
  exports: [Ip2RegionService],
})
export class Ip2RegionModule {}
