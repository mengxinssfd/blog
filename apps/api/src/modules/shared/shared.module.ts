import { Global, Module } from '@nestjs/common';
import { CaslAbilityFactory } from '@/guards/policies/casl-ability.factory';

/**
 * 全局分享模块
 * ---
 * providers和exports内的模块无需再次在使用到的模块内加providers
 */

@Global()
@Module({
  providers: [CaslAbilityFactory],
  exports: [CaslAbilityFactory],
})
export class SharedModule {}
