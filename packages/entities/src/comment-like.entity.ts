import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CommentEntity } from './comment.entity';
import { BaseLikeEntity } from './base-like.entity';
// 评论点赞
@Entity('comment_like')
export class CommentLikeEntity extends BaseLikeEntity {
  @ManyToOne(() => CommentEntity)
  @JoinColumn({ name: 'articleId' })
  comment!: CommentEntity;

  @Column({ select: false })
  commentId!: number;
}
