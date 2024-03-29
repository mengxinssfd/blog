import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity, ArticleEntity, CategoryEntity, TagEntity } from '@blog/entities';
import { UserService } from '../user/user.service';
import { CategoryService } from '../category/category.service';
import { TagService } from '../tag/tag.service';
import { TagModule } from '../tag/tag.module';

@Module({
  imports: [
    TagModule,
    TypeOrmModule.forFeature([ArticleEntity, CategoryEntity, UserEntity, TagEntity]),
  ],
  controllers: [ArticleController],
  providers: [ArticleService, UserService, CategoryService, TagService],
  exports: [ArticleService],
})
export class ArticleModule {}
