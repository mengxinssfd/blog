import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateArticleDto, UpdateArticleDto, ArticleListDto } from '@blog/dtos';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ARTICLE_STATE,
  ArticleEntity,
  ArticleLikeEntity,
  CommentEntity,
  TagEntity,
  UserEntity,
} from '@blog/entities';
import { In, Like, Not, Repository, SelectQueryBuilder } from 'typeorm';
import { omit } from '@tool-pack/basic';
import { rawsToEntities } from '@/utils/assemblyEntity';
import { PageDto } from '@blog/dtos/page.dto';
import initMarked from './init-marked';
import { marked } from 'marked';

const renderer = initMarked(marked);

enum SORT {
  createAtUp,
  createAtDown,
  updateAtUp,
  updateAtDown,
  viewCountUp,
  viewCountDown,
  likeCountUp,
  likeCountDown,
  // commentCountUp,
  // commentCountDown,
}
enum ORDER {
  up = 'ASC',
  down = 'DESC',
}

const SORT_MAP: Record<
  SORT,
  {
    sort: `article.${keyof ArticleEntity}` | 'articleLike.likeCount';
    order: ORDER;
  }
> = {
  [SORT.createAtUp]: { sort: 'article.createAt', order: ORDER.up },
  [SORT.createAtDown]: { sort: 'article.createAt', order: ORDER.down },
  [SORT.updateAtUp]: { sort: 'article.updateAt', order: ORDER.up },
  [SORT.updateAtDown]: { sort: 'article.updateAt', order: ORDER.down },
  [SORT.viewCountUp]: { sort: 'article.viewCount', order: ORDER.up },
  [SORT.viewCountDown]: { sort: 'article.viewCount', order: ORDER.down },
  [SORT.likeCountUp]: { sort: 'articleLike.likeCount', order: ORDER.up },
  [SORT.likeCountDown]: { sort: 'articleLike.likeCount', order: ORDER.down },
  // [SORT.commentCountUp]: { sort: 'article.updateAt', order: ORDER.up },
  // [SORT.commentCountDown]: { sort: 'article.updateAt', order: ORDER.down },
};

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
  ) {}

  async getTotal() {
    const alias = 'article';
    return await this.articleRepository
      .createQueryBuilder(alias)
      .select([
        `COUNT(${alias}.id) AS total`,
        `SUM(${alias}.viewCount) AS viewCount`,
        `SUM(CASE WHEN \`${alias}\`.\`status\` = '${ARTICLE_STATE.public}' THEN 1 ELSE 0 END) AS \`public\``,
        `SUM(CASE WHEN \`${alias}\`.\`deletedAt\` IS NOT NULL THEN 1 ELSE 0 END) AS \`delete\``,
        `SUM(CASE WHEN \`${alias}\`.\`status\` = '${ARTICLE_STATE.private}' THEN 1 ELSE 0 END) AS \`private\``,
      ])
      .withDeleted()
      .getRawOne();
  }

  private async createFindAllBuilders(
    { page = 1, pageSize = 10, keyword, tags = [], category, sort }: ArticleListDto,
    userId = 0,
    beforeClone?: (builder: SelectQueryBuilder<ArticleEntity>) => void | Promise<void>,
  ): Promise<[SelectQueryBuilder<ArticleEntity>, SelectQueryBuilder<ArticleEntity>]> {
    const _sort = SORT_MAP[sort as SORT] || SORT_MAP[SORT.createAtUp];

    const builder = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category');

    if (tags.length) {
      // tag子查询
      builder.andWhere((qb) => {
        return (
          '`article`.`id` IN ' +
          qb
            .subQuery()
            .select('`atc`.`id`')
            .from(TagEntity, 'tag')
            .leftJoin('tag.articleList', 'atc')
            .where({ id: In(tags) })
            .groupBy('`atc`.`id`')
            .getQuery()
        );
      });
    }
    if (category) builder.andWhere({ categoryId: category });
    if (keyword) builder.andWhere({ title: Like(`%${keyword}%`) });

    if (beforeClone) {
      const bcRes = beforeClone(builder);
      if (bcRes?.then) await bcRes;
    }

    // 可以查总数了
    const countBuilder = builder.clone();
    countBuilder.select('article.id');

    // 列表继续添加联查语句
    builder
      .addSelect(['`article`.`createAt`', '`article`.`updateAt`'])
      // 联查用户表
      .leftJoinAndSelect('article.author', 'author')
      // 联查标签表
      .leftJoinAndSelect('article.tags', 'tags')
      // 联查点赞表
      .leftJoin(
        (sqb) => {
          return sqb
            .select([
              'articleId',
              'COUNT(id) AS likeCount',
              `SUM(CASE WHEN userId = ${userId} THEN 1 ELSE 0 END ) AS checked`,
            ])
            .from(ArticleLikeEntity, 'lk')
            .groupBy('articleId');
        },
        'articleLike',
        'articleLike.articleId = article.id',
      )
      .addSelect(['articleLike.likeCount AS `like_count`', 'articleLike.checked AS `like_checked`'])
      // 联查留言表
      .leftJoin(
        (sqb) => {
          return sqb
            .select(['articleId', 'COUNT(id) AS commentCount'])
            .from(CommentEntity, 'cm')
            .groupBy('articleId');
        },
        'comments',
        'comments.articleId = article.id',
      )
      .addSelect(['comments.commentCount AS article_commentCount'])
      .orderBy(_sort.sort, _sort.order)
      .offset((page - 1) * pageSize)
      .limit(pageSize);

    return [countBuilder, builder];
  }

  private async handleFindAllBuilders(
    builders: ReturnType<typeof this.createFindAllBuilders>,
  ): Promise<{ list: ArticleEntity[]; count: number }> {
    const [countBuilder, builder] = await builders;

    const count = await countBuilder.getCount();
    if (count === 0) return { list: [], count };

    const raws = await builder.getRawMany();
    const list = rawsToEntities<ArticleEntity>({
      entityName: 'article',
      rawList: raws,
      valueToNumArr: ['like_count', 'like_checked', 'article_commentCount'],
      valueJoinToArr: ['tags'],
    });

    return { list, count };
  }

  async findAll(
    listDTO: ArticleListDto,
    userId = 0,
    fromWx?: { cateId: number },
  ): Promise<{ list: ArticleEntity[]; count: number }> {
    const builders = this.createFindAllBuilders(listDTO, userId, (builder) => {
      builder.andWhere({ status: String(ARTICLE_STATE.public) });
      if (fromWx) builder.andWhere({ categoryId: Not(fromWx.cateId) });
    });

    return await this.handleFindAllBuilders(builders);
  }

  async findAllByAuthor(pageDto: PageDto, authorId: number, userId: number) {
    const builders = this.createFindAllBuilders(pageDto as ArticleListDto, userId, (builder) => {
      builder.andWhere({ authorId });
    });

    return await this.handleFindAllBuilders(builders);
  }

  async findAllByLikeUser(pageDto: PageDto, userId: number) {
    const builders = this.createFindAllBuilders(pageDto as ArticleListDto, userId, (builder) => {
      builder.andWhere({ status: String(ARTICLE_STATE.public) }).andWhere((qb) => {
        return (
          'article.id IN ' +
          qb
            .subQuery()
            .select('like.articleId')
            .from(ArticleLikeEntity, 'like')
            .where({ userId })
            .getQuery()
        );
      });
    });

    return await this.handleFindAllBuilders(builders);
  }

  async findAllByCommentUser(pageDto: PageDto, userId: number) {
    const builders = this.createFindAllBuilders(pageDto as ArticleListDto, userId, (builder) => {
      builder.andWhere({ status: String(ARTICLE_STATE.public) }).andWhere((qb) => {
        return (
          'article.id IN ' +
          qb
            .subQuery()
            .select('articleId')
            .from(CommentEntity, 'comment')
            .where({ userId })
            .getQuery()
        );
      });
    });

    return await this.handleFindAllBuilders(builders);
  }

  updateViewCount(article: ArticleEntity) {
    this.articleRepository
      .createQueryBuilder()
      .update()
      .set({ viewCount: article.viewCount, version: article.version })
      .where({ id: article.id })
      .execute();
  }

  async findOneBase(id: number) {
    const article = await this.articleRepository.findOneBy({ id });
    if (!article) throw new NotFoundException('文章不存在');
    return article;
  }

  async findOne(id: number | string) {
    const getArticle = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'user')
      .leftJoinAndSelect('article.tags', 'tag')
      .leftJoinAndSelect('article.category', 'category')
      .where({ id })
      .addSelect([
        'article.content',
        'article.createAt',
        'article.updateAt',
        'article.authorId',
        'article.deletedAt',
      ])
      .addSelect(['tag.id', 'tag.name'])
      .addSelect(['category.id', 'category.name'])
      .withDeleted();

    const article = await getArticle.getOne();
    if (!article) throw new NotFoundException('文章不存在');

    return article;
  }

  markedRender(markdown: string): string {
    // 这样转换把代码里面的都换掉了
    // return marked(markdown.replace(/\n(?=\n)/g, '\n<br/>\n'), { renderer });
    return marked(markdown, { renderer });
  }

  async create(createArticleDto: CreateArticleDto, loginUser: UserEntity) {
    const article = new ArticleEntity();
    Object.assign(article, {
      ...omit(createArticleDto, ['isPublic']),
      status: Number(createArticleDto.isPublic ?? true),
    });
    article.authorId = loginUser.id;
    article.tags = createArticleDto.tags.map((tag) => Object.assign(new TagEntity(), { id: tag }));

    const articleEntity = await this.articleRepository.save(article);
    return { articleId: articleEntity.id };
  }

  async update(id: number, updateArticleDto: UpdateArticleDto) {
    const article = new ArticleEntity();
    Object.assign(article, omit(updateArticleDto, ['isPublic']));
    article.id = id;
    article.updateAt = new Date();
    if (updateArticleDto.tags && updateArticleDto.tags.length)
      article.tags = updateArticleDto.tags.map((tag) =>
        Object.assign(new TagEntity(), { id: tag }),
      );
    if (updateArticleDto.isPublic !== undefined) {
      article.status = Number(updateArticleDto.isPublic);
    }

    return await this.articleRepository.save(article);
  }

  async remove(id: number) {
    await this.articleRepository.softDelete(id);
  }

  async exists(id: number | string, withDeleted = false) {
    const rep = this.articleRepository
      .createQueryBuilder('article')
      .addSelect(['article.deletedAt'])
      .where({ id });
    if (withDeleted) rep.withDeleted();

    const find = await rep.getOne();
    if (!find) throw new NotFoundException('文章不存在');

    return find;
  }

  async restore(id: number) {
    const find = await this.exists(id, true);
    if (!find.deletedAt) throw new ForbiddenException('文章未删除');

    await this.articleRepository.restore(id);
  }

  async mute(article: ArticleEntity) {
    article.commentLock = !article.commentLock;
    // save会更新updateAt
    // await this.articleRepository.save(article);
    await this.articleRepository
      .createQueryBuilder('a')
      .update()
      .set({ commentLock: article.commentLock })
      .where({ id: article.id })
      .execute();

    return article.commentLock ? '文章评论已锁定' : '文章评论已解锁';
  }

  // 查找"关于"的条件
  aboutCondition() {
    const where = new ArticleEntity();
    where.authorId = 1; // 超级管理员id
    where.title = '关于';
    where.status = ARTICLE_STATE.private; // 私有的文章
    return where;
  }

  // 判断是否"关于"
  isAboutArticle(article: ArticleEntity): boolean {
    const where = this.aboutCondition();
    return (
      article.authorId === where.authorId &&
      article.title === where.title &&
      article.status === where.status
    );
  }

  async about() {
    // 设置条件
    const where = this.aboutCondition();
    // 查询
    const rep = this.articleRepository
      .createQueryBuilder('a')
      .addSelect(['a.content', 'a.createAt', 'a.updateAt'])
      .leftJoinAndSelect('a.author', 'at')
      .where({
        authorId: String(where.authorId),
        title: where.title,
        status: String(where.status),
      });
    const article = await rep.getOne();
    // 未发现
    if (!article) throw new NotFoundException('不存在关于');

    article.content = this.markedRender(article.content);
    return article;
  }
}
