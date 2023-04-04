import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  UserEntity,
  CommentEntity,
  ArticleEntity,
  CommentLikeEntity,
  CommentDislikeEntity,
} from '@blog/entities';
import { ArticleService } from '../article/article.service';
import { UserService } from '../user/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommentLikeEntity,
      CommentDislikeEntity,
      CommentEntity,
      ArticleEntity,
      UserEntity,
    ]),
  ],
  controllers: [CommentController],
  providers: [CommentService, ArticleService, UserService],
})
export class CommentModule {}
