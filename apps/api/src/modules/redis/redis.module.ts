import { Module } from '@nestjs/common';
import { AppRedisService } from '@/modules/redis/redis.service';

@Module({
  providers: [AppRedisService],
  exports: [AppRedisService],
})
export class AppRedisModule {}
