import { ArticleEntity } from './article.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseLikeEntity } from './base-like.entity';
// 点赞
@Entity('article_like')
export class ArticleLikeEntity extends BaseLikeEntity {
  static readonly modelName = 'ArticleLikeEntity' as const;

  @ManyToOne(() => ArticleEntity)
  @JoinColumn({ name: 'articleId' })
  article!: ArticleEntity;

  @Column('int', { select: false })
  articleId!: number;
}
