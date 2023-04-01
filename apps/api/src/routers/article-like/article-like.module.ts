import { Module } from '@nestjs/common';
import { ArticleLikeService } from './article-like.service';
import { ArticleLikeController } from './article-like.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity, ArticleEntity, ArticleLikeEntity } from '@blog/entities';
import { ArticleService } from '../article/article.service';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleLikeEntity, ArticleEntity, UserEntity])],
  controllers: [ArticleLikeController],
  providers: [ArticleLikeService, ArticleService],
})
export class ArticleLikeModule {}
