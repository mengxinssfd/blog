import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InitUserService } from '@/modules/init/init-user.service';
import { InitArticleService } from '@/modules/init/init-article.service';
import { ENV } from '@/utils/utils';

@Injectable()
export class InitService implements OnApplicationBootstrap {
  constructor(
    private readonly initUserService: InitUserService,
    private readonly initArticleService: InitArticleService,
  ) {}

  async onApplicationBootstrap() {
    await this.initUserService.registerRoot();
    if (ENV.isTest()) return;
    await this.initArticleService.initArticleAs();
  }
}
