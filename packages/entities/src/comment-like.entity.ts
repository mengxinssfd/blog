import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CommentEntity } from './comment.entity';
import { BaseLikeEntity } from './base-like.entity';
// 评论点赞
@Entity('comment_like')
export class CommentLikeEntity extends BaseLikeEntity {
  static override readonly modelName = 'CommentLikeEntity' as const;

  @ManyToOne(() => CommentEntity, (comment) => comment.like)
  @JoinColumn({ name: 'commentId' })
  comment!: CommentEntity;

  @Column('int', { select: true })
  commentId!: number;
}
