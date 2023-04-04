import { Module } from '@nestjs/common';
import { CommentDislikeService } from './comment-dislike.service';
import { CommentDislikeController } from './comment-dislike.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity, CommentDislikeEntity, UserEntity } from '@blog/entities';
import { CommentService } from '../comment/comment.service';

@Module({
  imports: [TypeOrmModule.forFeature([CommentDislikeEntity, CommentEntity, UserEntity])],
  controllers: [CommentDislikeController],
  providers: [CommentDislikeService, CommentService],
})
export class CommentDislikeModule {}
