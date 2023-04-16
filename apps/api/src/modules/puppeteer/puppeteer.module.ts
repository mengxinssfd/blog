import { Module } from '@nestjs/common';
import { PuppeteerModule } from '@mxssfd/nest-puppeteer';
import { AppPuppeteerService } from './puppeteer.service';
import { FileService } from '@/routers/file/file.service';

@Module({
  imports: [
    PuppeteerModule.forRoot({
      pipe: true,
      headless: true,
      // 在浏览器输入url：`chrome://flags/`可以看到所有args
      args: [
        '--disable-notifications',
        // '--single-process',
        '--no-first-run',
        '--no-zygote',
        // 禁止插件
        '--disable-extensions',
        // 禁用沙箱模式，以在Linux服务器上运行Puppeteer时避免一些权限问题。
        '--no-sandbox',
        // 禁用setuid沙箱模式，在某些环境下可以提高性能。
        '--disable-setuid-sandbox',
        // 禁用/dev/shm使用，以减少内存使用量。
        '--disable-dev-shm-usage',
        // 禁用加速的2D画布，以提高截图的质量。
        '--disable-accelerated-2d-canvas',
        // 隐藏滚动条，以获得更清晰的截图。
        '--hide-scrollbars',
        // 禁用GPU加速，以避免在某些环境下出现兼容性问题
        '--disable-gpu',
        // 禁用浏览器通知，以避免在截图时出现干扰。
        '--disable-notifications',
        // 禁用浏览器信息栏，以获得更干净的截图。
        '--disable-infobars',
      ],
    }),
  ],
  providers: [AppPuppeteerService, FileService],
  exports: [AppPuppeteerService],
})
export class AppPuppeteerModule {}
