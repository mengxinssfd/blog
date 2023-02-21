import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseLikeEntity } from './base-like.entity';
import { CommentEntity } from './comment.entity';

@Entity('comment_dislike')
export class CommentDislikeEntity extends BaseLikeEntity {
  @ManyToOne(() => CommentEntity)
  @JoinColumn({ name: 'articleId' })
  comment!: CommentEntity;

  @Column({ select: false })
  commentId!: number;
}
