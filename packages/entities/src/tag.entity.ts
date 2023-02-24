import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';
import { BlogBaseEntity } from './base.entity';
import { UserEntity } from './user.entity';
import { ArticleEntity } from './article.entity';

@Entity('tag')
export class TagEntity extends BlogBaseEntity {
  static readonly modelName = 'TagEntity' as const;

  @Column('varchar', { length: 24, comment: 'tag名', unique: true })
  name!: string;
  @Column('varchar', { length: 255, comment: '描述' })
  description!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'createById' })
  createBy!: number;

  @Column('int', { comment: '创建人id' })
  createById!: number;

  @ManyToMany(() => ArticleEntity, (a) => a.tags)
  articleList?: ArticleEntity[];

  articleCount?: number;
}
