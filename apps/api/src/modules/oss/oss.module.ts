// import { type Options } from 'ali-oss';
import { TOKEN } from '@/modules/oss/oss.constant';
import { OssService } from '@/modules/oss/oss.service';
import { AppConfigService } from '@/app.config.service';
// import { DynamicModule, Module, type FactoryProvider } from '@nestjs/common';
import { Module } from '@nestjs/common';

@Module({
  providers: [
    {
      provide: TOKEN,
      inject: [AppConfigService],
      useFactory(configService: AppConfigService) {
        return configService.val('oss');
      },
    },
    OssService,
  ],
  exports: [OssService],
})
export class OssModule {
  // static forRootAsync(): DynamicModule {
  //   const configProvider: FactoryProvider<Options> = {
  //     provide: TOKEN,
  //     inject: [AppConfigService],
  //     useFactory(configService: AppConfigService) {
  //       return configService.val('oss');
  //     },
  //   };
  //   return {
  //     providers: [configProvider, OssService],
  //     module: OssModule,
  //     exports: [OssService],
  //   };
  // }
}
