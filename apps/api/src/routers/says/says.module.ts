import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaysEntity } from '@blog/entities';
import { Ip2RegionModule } from '@/modules/ip2region/ip2region.module';
import { SaysController } from './says.controller';
import { SaysService } from './says.service';

@Module({
  imports: [Ip2RegionModule, TypeOrmModule.forFeature([SaysEntity])],
  controllers: [SaysController],
  providers: [SaysService],
})
export class SaysModule {}
