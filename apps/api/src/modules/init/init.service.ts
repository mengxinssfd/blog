import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Logger } from '@/utils/log4js';
import { ArticleService } from '@/routers/article/article.service';
import { CategoryService } from '@/routers/category/category.service';
import { TagService } from '@/routers/tag/tag.service';
import { UserService } from '@/routers/user/user.service';
import { AppConfigService } from '@/app.config.service';

@Injectable()
export class InitService implements OnApplicationBootstrap {
  constructor(
    private readonly articleService: ArticleService,
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService,
    private readonly userService: UserService,
    private readonly configService: AppConfigService,
  ) {}

  async onApplicationBootstrap() {
    await this.registerRoot();
    await this.iniArticleAs();
  }

  async registerRoot() {
    const { count } = await this.userService.findAll();
    if (count) return;

    const admin = this.configService.val('admin');

    await this.userService.register({ nickname: admin.username, ...admin }, '127.0.0.1');
    Logger.info('初始账号注册成功');
  }

  async iniArticleAs() {
    const blogCate = await this.categoryService.findOrCreate({
      name: '博客',
      description: '博客相关分类',
    });
    const blogTag = await this.tagService.findOrCreate({
      name: '博客',
      description: '博客相关标签',
    });

    await this.articleService.findAsOrCreate({
      description: '友链',
      title: '友链',
      as: 'friend-link',
      tags: [blogTag.id],
      categoryId: blogCate.id,
    });
    await this.articleService.findAsOrCreate({
      description: '关于我',
      title: '关于',
      as: 'about',
      tags: [blogTag.id],
      categoryId: blogCate.id,
    });
  }
}
