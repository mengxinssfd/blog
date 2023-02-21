import { BlogBaseEntity } from './base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { UserEntity } from './user.entity';
import { ArticleEntity } from './article.entity';
import { CommentLikeEntity } from './comment-like.entity';
import { CommentDislikeEntity } from './comment-dislike.entity';

@Entity({ name: 'comment' })
export class CommentEntity extends BlogBaseEntity {
  @Column({
    type: 'text',
    comment: '评论内容',
    charset: 'utf8mb4',
  })
  content!: string;

  @ManyToOne(() => ArticleEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'articleId' })
  article!: number;
  @Column({ comment: '文章id' })
  articleId!: number;

  @Column({ comment: '是否置顶', nullable: true })
  isTop!: boolean;

  // ---------------- 二级评论 ----------------
  @ManyToOne(() => CommentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent!: CommentEntity;
  // 不能被replyId代替,如果reply被删掉的话就找不到父级了
  @Column({ comment: '父级评论id 有parentId的为二级评论', nullable: true })
  parentId!: number;

  @ManyToOne(() => CommentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'replyId' })
  reply!: CommentEntity;
  @Column({ comment: '回复的评论id', nullable: true })
  replyId!: number;
  @Column({ comment: '回复的评论之人', nullable: true })
  replyUserId!: number;
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'replyUserId' })
  replyUser!: UserEntity;
  // ---------------- 二级评论 ----------------

  // ---------------- 注册用户 ----------------
  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;
  @Column({ nullable: true, comment: '评论人id' })
  userId!: number;
  // ---------------- 注册用户 ----------------

  // ---------------- 游客 ----------------
  @Column('varchar', {
    length: '255,255,255,255'.length,
    comment: '游客ip',
    nullable: true,
  })
  touristIp!: string;

  @Column('varchar', { length: 24, comment: '游客名', nullable: true })
  touristName!: string;
  // ---------------- 游客 ----------------

  @OneToMany(() => CommentLikeEntity, (like) => like.commentId, {
    onDelete: 'CASCADE',
  })
  like!: { checked: number; count: number };

  @OneToMany(() => CommentDislikeEntity, (like) => like.commentId, {
    onDelete: 'CASCADE',
  })
  dislike!: { checked: number; count: number };
}
