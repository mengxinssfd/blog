import { Module } from '@nestjs/common';
import { CommentLikeService } from './comment-like.service';
import { CommentLikeController } from './comment-like.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity, CommentEntity, CommentLikeEntity } from '@blog/entities';
import { CommentService } from '../comment/comment.service';

@Module({
  imports: [TypeOrmModule.forFeature([CommentLikeEntity, CommentEntity, UserEntity])],
  controllers: [CommentLikeController],
  providers: [CommentLikeService, CommentService],
})
export class CommentLikeModule {}
