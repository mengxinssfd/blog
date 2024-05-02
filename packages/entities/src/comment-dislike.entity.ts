import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseLikeEntity } from './base-like.entity';
import { CommentEntity } from './comment.entity';

@Entity('comment_dislike')
export class CommentDislikeEntity extends BaseLikeEntity {
  static override readonly modelName = 'CommentDislikeEntity' as const;

  @ManyToOne(() => CommentEntity, (comment) => comment.dislike)
  @JoinColumn({ name: 'commentId' })
  comment!: CommentEntity;

  @Column('int', { select: true })
  commentId!: number;
}
