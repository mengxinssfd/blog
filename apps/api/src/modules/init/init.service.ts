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
      content: `
1. 不添加广告网站和违法网站，博客网站最好在 5 篇文章以上。
1. 若域名为公共（二级分发）、免费域名，视站点质量添加。
1. 博主更喜欢内容有趣的和生活类的博客，会更多地访问博客进行互动并添加到关注列表。
1. 为了友链的统一性和美观性，昵称过长或包含博客、XX 的 XX 等内容将被简化。
1. 通常按添加时间进行排序，优秀站点可能会提升顺序。
1. 若站点长期失联（无法访问）将会删除友链。
1. 申请友链之前请先添加本站链接。
`.trim(),
    });
    await this.articleService.findAsOrCreate({
      description: '关于页',
      title: '关于我',
      as: 'about',
      tags: [blogTag.id],
      categoryId: blogCate.id,
      content: '',
    });
  }
}
