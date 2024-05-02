import { BlogBaseEntity } from './base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ArticleEntity } from './article.entity';
import { UserEntity } from './user.entity';

// 分类
@Entity({ name: 'category' })
export class CategoryEntity extends BlogBaseEntity {
  static override readonly modelName = 'CategoryEntity' as const;

  @Column('varchar', { length: 24, comment: '分类名', unique: true })
  name!: string;
  @Column('varchar', { length: 255, comment: '描述' })
  description!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'createById' })
  createBy!: UserEntity;

  @Column('int', { comment: '创建人id', select: false })
  createById!: number;

  @OneToMany(() => ArticleEntity, (article) => article.category)
  articleList!: ArticleEntity[];

  articleCount!: number;
}
