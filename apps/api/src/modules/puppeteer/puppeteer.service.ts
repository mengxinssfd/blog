import { Injectable } from '@nestjs/common';
import { FriendLinkEntity } from '@blog/entities';
import { Logger } from '@/utils/log4js';
// import { InjectContext } from '@mxssfd/nest-puppeteer';
// import { BrowserContext } from 'puppeteer';
import { FileHelperService } from '@/modules/file-helper/file-helper.service';
import puppeteer, { Browser } from 'puppeteer';

@Injectable()
export class AppPuppeteerService {
  private browser: Browser | null = null;

  constructor(
    // @InjectContext() private readonly browserContext: BrowserContext,
    private readonly fileHelperService: FileHelperService,
  ) {}

  private async getBrowser(): Promise<Browser> {
    if (this.browser) return this.browser;
    return (this.browser = await puppeteer.launch({
      // pipe: true,
      headless: 'new',
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
    }));
  }

  private async newPage() {
    const browser = await this.getBrowser();
    return browser.newPage();
  }

  async destroy() {
    if (this.browser?.isConnected()) await this.browser.close();
  }

  async getSiteInfoWithScreenshotUrl(link: string, filename?: string) {
    const siteInfo = await this.getSiteInfo(link);
    const timeStart = Date.now();
    const screenshotUrl = await this.fileHelperService.create(siteInfo.screenshot, {
      filename: filename || new URL(link).host,
      ownerId: 1,
      mimetype: 'image/webp',
    });
    Logger.info(
      '上传截图',
      link,
      '到oss',
      screenshotUrl,
      '共耗时：',
      Date.now() - timeStart,
      '毫秒',
    );
    return { ...siteInfo, screenshot: screenshotUrl };
  }

  async getSiteInfo(link: string) {
    const timeStart = Date.now();
    const page = await this.newPage();
    try {
      Logger.info('访问站点', link);
      await page.setViewport({ width: 1600, height: 900 });
      await page.goto(link, { waitUntil: 'networkidle2' });
      await page.content();
      Logger.info('获取站点信息', link);
      const info = await page.evaluate((link) => {
        return {
          name: document.title,
          desc:
            (document.querySelector('meta[name=description]') as HTMLMetaElement)?.content || '',
          avatar:
            (
              document.querySelector(
                'link[rel="icon"],link[rel^="icon "],link[rel$=" icon"]',
              ) as HTMLLinkElement
            )?.href || `${link}/favicon.ico`,
        } satisfies Pick<FriendLinkEntity, 'name' | 'desc' | 'avatar'>;
      }, link);
      Logger.info('生成站点截图', link);
      const screenshot = await page.screenshot({ encoding: 'binary', quality: 10, type: 'webp' });
      Logger.info('从访问站点到截图完成共耗时：', Date.now() - timeStart, '毫秒');
      return { ...info, screenshot };
    } catch (e) {
      Logger.error(e);
      Logger.info(e);
      throw e;
    } finally {
      await page.close();
    }
  }
}
