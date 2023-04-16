import { Injectable } from '@nestjs/common';
import { FriendLinkEntity } from '@blog/entities';
import { Logger } from '@/utils/log4js';
import { InjectContext } from '@mxssfd/nest-puppeteer';
import { BrowserContext } from 'puppeteer';
import { FileService } from '@/routers/file/file.service';

@Injectable()
export class AppPuppeteerService {
  constructor(
    @InjectContext() private readonly browserContext: BrowserContext,
    private readonly fileService: FileService,
  ) {}

  async getSiteInfoWithScreenshotUrl(link: string, filename?: string) {
    const siteInfo = await this.getSiteInfo(link);
    const screenshotUrl = await this.fileService.create(
      filename || siteInfo.name,
      siteInfo.screenshot,
      false,
    );
    Logger.info('上传截图到oss', link, screenshotUrl);
    return { ...siteInfo, screenshot: screenshotUrl };
  }

  async getSiteInfo(link: string) {
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
      const screenshot = await page.screenshot({ encoding: 'binary', type: 'jpeg' });
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
