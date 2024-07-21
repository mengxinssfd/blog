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

  async initArticleAs() {
    const [categoryId, tagId] = await Promise.all([this.initCate(), this.initTag()]);
    for (const page of this.pageList) {
      await this.articleService.findAsOrCreate({
        ...page,
        content: page.content || '无',
        tags: [tagId],
        categoryId,
      });
    }
  }

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

  private readonly pageList: Array<{
    title: string;
    description: string;
    as: string;
    content?: string;
  }> = [
    {
      title: '首页',
      description: '首页',
      as: 'index',
    },
    {
      title: '友链',
      description: '友链',
      as: 'friend-link',
      content: `
1. 不添加广告网站和违法网站，博客网站最好在 5 篇文章以上。
1. 若域名为公共（二级分发）、免费域名，视站点质量添加。
1. 博主更喜欢内容有趣的和生活类的博客，会更多地访问博客进行互动并添加到关注列表。
1. 为了友链的统一性和美观性，昵称过长或包含博客、XX 的 XX 等内容将被简化。
1. 通常按添加时间进行排序，优秀站点可能会提升顺序。
1. 若站点长期失联（无法访问）将会删除友链。
1. 申请友链之前请先添加本站链接。
`.trim(),
    },
    {
      title: '关于我',
      description: '关于页',
      as: 'about',
    },
    {
      title: '图片格式转换压缩工具',
      description: '个基于canvas的图片格式转换与压缩工具',
      as: 'tools/transform-img-type',
    },
    {
      title: '项目',
      description: '个人业余时间写的一些项目',
      as: 'project',
    },
    {
      title: '说说',
      description: '我的生活、吐槽、闲话...',
      as: 'says',
    },
    {
      title: '记忆助手',
      description: '帮助记忆信息的一个小工具',
      as: 'tools/memory-helper',
    },
    {
      title: '录屏工具',
      description: 'PC 录屏工具',
      as: 'tools/record',
      content: `
操作步骤：
</br>
1. 点击开启屏幕共享，然后在弹起的窗口选择要录屏的区域；
2. 点击开启录制;
3. 点击停止录制将会获得一个录制视频;
4. 可以点击关闭共享关闭屏幕共享，也可以点击浮窗上的按钮关闭屏幕共享。
</br>
***
</br>
⚠️注意：记得随时保存录屏为文件，刷新或离开此页面后会丢失录制的视频！
`.trim(),
    },
    {
      title: 'WebRTC 工具',
      description: 'WebRTC 工具',
      as: 'tools/rtc',
      content: `
操作步骤：
<br>
1. 在发送端填写口令并创建
2. 在接收端填写在发送端创建的口令并连接
3. 选择文件
4. 发送文件
5. 文件接收完毕后选择文件下载        
      `.trim(),
    },
    {
      title: '更新日志',
      description: '博客更新日志',
      as: 'changelog',
      content: '无',
    },
  ];
}
