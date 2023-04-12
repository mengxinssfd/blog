import { Global, Module } from '@nestjs/common';
import { CaslAbilityFactory } from '@/guards/policies/casl-ability.factory';
import { AppConfigService } from '@/app.config.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@/guards/auth/jwt-auth.guard';

/**
 * 全局分享模块
 * ---
 * providers和exports内的模块无需再次在使用到的模块内加providers
 */

@Global()
@Module({
  providers: [
    CaslAbilityFactory,
    AppConfigService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [CaslAbilityFactory, AppConfigService],
})
export class SharedModule {}
