import { Module } from '@nestjs/common';
import { InitService } from '@/modules/init/init.service';
import { ArticleModule } from '@/routers/article/article.module';
import { CategoryModule } from '@/routers/category/category.module';
import { TagModule } from '@/routers/tag/tag.module';
import { UserModule } from '@/routers/user/user.module';

@Module({
  imports: [UserModule, ArticleModule, CategoryModule, TagModule],
  providers: [InitService],
  exports: [InitService],
})
export class InitModule {}
