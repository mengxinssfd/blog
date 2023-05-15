import { Injectable } from '@nestjs/common';
import { ArticleService } from '@/routers/article/article.service';
import { CategoryService } from '@/routers/category/category.service';
import { TagService } from '@/routers/tag/tag.service';

@Injectable()
export class InitArticleService {
  constructor(
    private readonly articleService: ArticleService,
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService,
  ) {}

  private async initCate() {
    const cate = await this.categoryService.findOrCreate({
      name: '博客',
      description: '博客相关分类',
    });
    return cate.id;
  }

  private async initTag() {
    const tag = await this.tagService.findOrCreate({
      name: '博客',
      description: '博客相关标签',
    });
    return tag.id;
  }

  private initFriendLink(categoryId: number, tagId: number) {
    return this.articleService.findAsOrCreate({
      title: '友链',
      description: '友链',
      as: 'friend-link',
      tags: [tagId],
      categoryId,
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
  }

  private iniAbout(categoryId: number, tagId: number) {
    return this.articleService.findAsOrCreate({
      title: '关于我',
      description: '关于页',
      as: 'about',
      tags: [tagId],
      categoryId,
      content: '无',
    });
  }

  private initTransformImgType(categoryId: number, tagId: number) {
    return this.articleService.findAsOrCreate({
      title: '图片格式转换压缩工具',
      description: '个基于canvas的图片格式转换与压缩工具',
      as: 'tools/transform-img-type',
      tags: [tagId],
      categoryId,
      content: '无',
    });
  }

  async iniArticleAs() {
    const [categoryId, tagId] = await Promise.all([this.initCate(), this.initTag()]);
    await this.initFriendLink(categoryId, tagId);
    await this.iniAbout(categoryId, tagId);
    await this.initTransformImgType(categoryId, tagId);
  }
}
