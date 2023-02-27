import {
  Column,
  Entity,
  VersionColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { BlogBaseEntity } from './base.entity';
import { CategoryEntity } from './category.entity';
import { ArticleLikeEntity } from './article-like.entity';
import { CommentEntity } from './comment.entity';
import { TagEntity } from './tag.entity';

export enum ARTICLE_STATE {
  private,
  public,
}
@Entity({ name: 'article' })
export class ArticleEntity extends BlogBaseEntity {
  static readonly STATE = ARTICLE_STATE;

  static readonly modelName = 'ArticleEntity' as const;

  @Column('enum', {
    enum: ARTICLE_STATE,
    default: ARTICLE_STATE.public,
    comment: '状态：0：公开,1：只能自己看',
  })
  status!: ARTICLE_STATE;

  // 更新次数
  @VersionColumn({ comment: '更新次数' })
  version!: number;

  // 文章标题
  @Column('varchar', { length: 254, comment: '文章标题' })
  title!: string;

  // 文章描述
  @Column('varchar', { length: 254, comment: '文章描述' })
  description!: string;

  // 文章内容
  @Column({
    // 改表字段类型tips： 先用命令把MYSQL表字段类型改了，然后再改typeorm的表字段类型，就不会清空内容了
    // ALTER TABLE article Modify column content longtext charset utf8mb4;
    type: 'longtext',
    comment: '文章内容',
    select: false,
    charset: 'utf8mb4',
  })
  content!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'authorId' })
  author!: UserEntity;

  @Column('int', { comment: '作者id', select: false })
  authorId!: number;

  @ManyToOne(() => CategoryEntity)
  @JoinColumn({ name: 'categoryId' })
  category!: CategoryEntity;

  @Column('int', { comment: '分类id', select: false })
  categoryId!: number;

  @Column('int', { comment: '文章被查看数', default: 0 })
  viewCount!: number;

  @OneToMany(() => ArticleLikeEntity, (like) => like.articleId)
  like!: { checked: number; count: number };

  @OneToMany(() => CommentEntity, (comment) => comment.articleId)
  commentCount!: number;

  // 可参考官网的多对多关系
  @ManyToMany(() => TagEntity, (tag) => tag.articleList, { cascade: true })
  @JoinTable({
    name: 'article_link_tag',
    joinColumn: {
      name: 'articleId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tagId',
      referencedColumnName: 'id',
    },
  })
  tags!: TagEntity[];

  @Column('varchar', {
    length: 500,
    comment: '封面',
    default:
      'http://img.desktx.com/d/file/wallpaper/scenery/20170107/7cd0dae5f6adf31e51626333b9614bff.jpg',
  })
  cover!: string;

  @Column('varchar', {
    length: 500,
    comment: '背景音乐',
    default: '',
  })
  bgm!: string;

  @Column({
    comment: '评论锁',
    default: false,
  })
  commentLock!: boolean;
}
