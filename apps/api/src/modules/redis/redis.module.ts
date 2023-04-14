import { Global, Module } from '@nestjs/common';
import { AppRedisService } from '@/modules/redis/redis.service';

@Global()
@Module({
  providers: [AppRedisService],
  exports: [AppRedisService],
})
export class AppRedisModule {}
