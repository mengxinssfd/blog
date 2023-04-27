import { Injectable } from '@nestjs/common';
import { FriendLinkEntity } from '@blog/entities';
import { Logger } from '@/utils/log4js';
import { InjectContext } from '@mxssfd/nest-puppeteer';
import { BrowserContext } from 'puppeteer';
import { FileHelperService } from '@/modules/file-helper/file-helper.service';

@Injectable()
export class AppPuppeteerService {
  constructor(
    @InjectContext() private readonly browserContext: BrowserContext,
    private readonly fileHelperService: FileHelperService,
  ) {}

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
    const page = await this.browserContext.newPage();
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
