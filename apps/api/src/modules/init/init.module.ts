import { Module } from '@nestjs/common';
import { ArticleModule } from '@/routers/article/article.module';
import { CategoryModule } from '@/routers/category/category.module';
import { TagModule } from '@/routers/tag/tag.module';
import { UserModule } from '@/routers/user/user.module';
import { InitService } from './init.service';
import { InitUserService } from './init-user.service';
import { InitArticleService } from './init-article.service';

@Module({
  imports: [UserModule, ArticleModule, CategoryModule, TagModule],
  providers: [InitService, InitUserService, InitArticleService],
  exports: [InitService],
})
export class InitModule {}
