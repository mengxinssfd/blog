import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { ArticleService } from '../article/article.service';
import { UserService } from '../user/user.service';
import { CommentService } from '../comment/comment.service';
import { ArticleLikeService } from '../article-like/article-like.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity, ArticleLikeEntity, CommentEntity, UserEntity } from '@blog/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArticleEntity, UserEntity, CommentEntity, ArticleLikeEntity]),
  ],
  controllers: [StatisticsController],
  providers: [ArticleService, UserService, CommentService, ArticleLikeService],
})
export class StatisticsModule {}
