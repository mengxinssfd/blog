import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ListDTO } from './dto/list.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ARTICLE_STATE,
  ArticleEntity,
  ArticleLikeEntity,
  CommentEntity,
  ROLE,
  TagEntity,
  UserEntity,
} from '@blog/entities';
import { getConnection, In, Repository, Like, Not } from 'typeorm';
import { omit, unique } from '@tool-pack/basic';
import { rawsToEntities } from '@/utils/assemblyEntity';
import { PageDto } from '@/common/dto/page.dto';
import initMarked from './init-marked';
import { marked } from 'marked';

const renderer = initMarked(marked);
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

  private async getArticleIdsFromTags(tagIds: number[]): Promise<number[]> {
    const tags = await TagEntity.createQueryBuilder('tag')
      .leftJoinAndSelect('tag.articleList', 'article')
      .where({ id: In(tagIds) })
      .getMany();

    if (!tags.length) return [];

    const articleList = tags.reduce(
      (res, tag) => (res.push(...(tag.articleList || [])), res),
      [] as ArticleEntity[],
    );

    return unique(articleList, (a, b) => a.id === b.id).map((a) => a.id);
  }

  async findAll(
    listDTO: ListDTO,
    userId = 0,
    fromWx?: { cateId: number },
  ): Promise<{ list: ArticleEntity[]; count: number }> {
    const { page = 1, pageSize = 10, keyword } = listDTO;

    console.log(userId, fromWx);

    enum Sort {
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
    enum Order {
      up = 'ASC',
      down = 'DESC',
    }

    const SORT: Record<Sort, { sort: string; order: Order; outerSort?: string }> = {
      [Sort.createAtUp]: { sort: 'article.createAt', order: Order.up },
      [Sort.createAtDown]: { sort: 'article.createAt', order: Order.down },
      [Sort.updateAtUp]: { sort: 'article.updateAt', order: Order.up },
      [Sort.updateAtDown]: { sort: 'article.updateAt', order: Order.down },
      [Sort.viewCountUp]: { sort: 'article.viewCount', order: Order.up },
      [Sort.viewCountDown]: { sort: 'article.viewCount', order: Order.down },
      [Sort.likeCountUp]: {
        sort: '`articleLike`.likeCount',
        outerSort: '`article`.likeCount',
        order: Order.up,
      },
      [Sort.likeCountDown]: {
        sort: '`articleLike`.likeCount',
        outerSort: '`article`.likeCount',
        order: Order.down,
      },
      // [Sort.commentCountUp]: { sort: 'article.updateAt', order: Order.up },
      // [Sort.commentCountDown]: { sort: 'article.updateAt', order: Order.down },
    };
    const sort = SORT[listDTO.sort as Sort] || SORT[Sort.createAtUp];

    const builder = this.articleRepository.createQueryBuilder('article');

    builder
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.category', 'category');

    if (listDTO.category) builder.where({ categoryId: listDTO.category });

    if (listDTO.tag && listDTO.tag.length) {
      const articleIds = await this.getArticleIdsFromTags(listDTO.tag);
      if (articleIds.length) builder.where({ id: In(articleIds) });
    }

    if (keyword) builder.where({ title: Like(`%${keyword}%`) });
    if (fromWx) builder.where({ categoryId: Not(fromWx.cateId) });

    const countBuilder = builder.clone();

    builder
      .leftJoinAndSelect('article.tags', 'tags')
      .leftJoin(
        (sqb) => {
          return (
            sqb
              // .subQuery()
              .select([
                'ANY_VALUE(lk.id) AS likeId',
                'ANY_VALUE(lk.userId) AS userId',
                'ANY_VALUE(lk.articleId) AS articleId',
                'COUNT(lk.id) AS likeCount',
                `SUM(CASE WHEN lk.userId = ${userId} THEN 1 ELSE 0 END ) AS checked`,
              ])
              .from(ArticleLikeEntity, 'lk')
              .groupBy('lk.articleId')
          );
        },
        'like',
        'like.articleId = article.id',
      )
      .addSelect(['like.likeCount AS `like_count`', 'like.checked AS `like_checked`'])
      .leftJoin(
        (sqb) => {
          return (
            sqb
              // .subQuery()
              .select([
                'ANY_VALUE(cm.id) AS id',
                'ANY_VALUE(cm.articleId) AS articleId',
                'COUNT(cm.id) AS commentCount',
              ])
              .from(CommentEntity, 'cm')
              .groupBy('cm.articleId')
          );
        },
        'comments',
        'comments.articleId = article.id',
      )
      .addSelect(['comments.commentCount AS article_commentCount'])
      .orderBy(sort.sort, sort.order)
      .offset((page - 1) * pageSize)
      .limit(pageSize);

    console.log(builder.getQuery());

    const [_list, count] = await Promise.all([builder.getRawMany(), countBuilder.getCount()]);
    // const [list, count] = await Promise.all([builder.getRawMany(), builder.getCount()]);

    const list = rawsToEntities<ArticleEntity>({
      entityName: 'article',
      rawList: _list,
      valueToNumArr: ['like_count', 'like_checked', 'article_commentCount'],
      valueJoinToArr: ['tags'],
    });
    console.log(list, count);

    return { list, count };
  }

  async findAllByAuthor(pageDto: PageDto, authorId: number, userId: number) {
    const { page = 1, pageSize = 10 } = pageDto;

    const sort: { sort: string; order: 'DESC' } = {
      sort: 'article.createAt',
      order: 'DESC',
    };

    const getList = getConnection().createQueryBuilder();
    const getCount = this.articleRepository
      .createQueryBuilder('article')
      .groupBy('article.id')
      .where({ authorId });

    if (!userId || userId !== authorId) {
      getCount.andWhere('article.status = :status', {
        status: String(ARTICLE_STATE.public),
      });
    }

    getList
      .from<ArticleEntity>((qb) => {
        qb.select([
          'article.*',
          `ROW_NUMBER() OVER (ORDER BY ${sort.sort} ${sort.order}, article.id) AS \`rowid\``,
        ])
          .from(ArticleEntity, 'article')
          .leftJoinAndSelect(
            (qb2) => {
              return qb2
                .subQuery()
                .select([
                  'lk.id AS likeId',
                  'lk.userId AS userId',
                  'lk.articleId AS articleId',
                  'COUNT(lk.id) AS likeCount',
                  `SUM(CASE WHEN lk.userId = ${authorId} THEN 1 ELSE 0 END ) AS checked`,
                ])
                .from(ArticleLikeEntity, 'lk')
                .groupBy('lk.articleId');
            },
            'articleLike',
            'articleLike.articleId = article.id',
          )
          .where({ authorId });

        if (!userId || userId !== authorId) {
          qb.andWhere('article.status = :status', {
            status: String(ARTICLE_STATE.public),
          });
        }
        return qb;
      }, 'article')
      // limit在这里有bug 重复的也会算成一条数据导致不准确，使用over代替
      .where('`article`.`rowid` between :start and :end', {
        start: (page - 1) * pageSize + 1,
        end: page * pageSize,
      });
    (getList.expressionMap.mainAlias as any).metadata =
      getList.connection.getMetadata(ArticleEntity);
    getList
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.category', 'category')
      // .leftJoinAndSelect(ArticleLinkTagEntity, 'link', 'link.articleId = article.id')
      .leftJoinAndSelect(CommentEntity, 'comment', 'comment.articleId = article.id')
      .leftJoinAndMapMany('article.tags', TagEntity, 'tags', 'tags.id = link.tagId')
      .select([
        'article.id',
        'article.title',
        'article.description',
        'article.createAt',
        'article.updateAt',
        'article.viewCount',
        'article.cover',
      ])
      .addSelect(['article.likeCount AS `like_count`', 'article.checked AS `like_checked`'])
      .addSelect('COUNT(comment.id) AS `article_commentCount`')
      .addSelect(['tags.id', 'tags.name'])
      .addSelect(['id', 'nickname', 'role', 'username', 'avatar'].map((i) => 'author.' + i))
      .addSelect(['id', 'name', 'description'].map((i) => 'category.' + i))
      .groupBy('article.id, link.id')
      .addGroupBy(sort.sort)
      .orderBy(sort.sort, sort.order);
    const [list, count] = await Promise.all([getList.getRawMany(), getCount.getCount()]);

    // 手动组装实体
    // like用COUNT的话，不能映射到实体，而且article再用getCount的话就没有raw数据，就不能拼接数据
    // 使用了left join(select...)不能组装entity
    const entityList = rawsToEntities<ArticleEntity>({
      entityName: 'article',
      rawList: list,
      valueJoinToArr: ['tags'],
      valueToNumArr: ['like_count', 'like_checked', 'article_commentCount'],
      omitArr: ['list_count'],
    });

    return {
      list: entityList,
      count,
    };
  }

  async findAllByLikeUser(pageDto: PageDto, userId: number) {
    const { page = 1, pageSize = 10 } = pageDto;

    const sort: { sort: string; order: 'DESC' } = {
      sort: 'article.createAt',
      order: 'DESC',
    };

    const getList = getConnection().createQueryBuilder();
    const getCount = this.articleRepository
      .createQueryBuilder('article')
      .groupBy('article.id')
      .where('article.status = :status', {
        status: String(ARTICLE_STATE.public),
      })
      .andWhere((qb) => {
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
    getList
      .from<ArticleEntity>((qb) => {
        qb.select([
          'article.*',
          `ROW_NUMBER() OVER (ORDER BY ${sort.sort} ${sort.order}, article.id) AS \`rowid\``,
        ])
          .from(ArticleEntity, 'article')
          .leftJoinAndSelect(
            (qb2) => {
              return qb2
                .subQuery()
                .select([
                  'lk.id AS likeId',
                  'lk.userId AS userId',
                  'lk.articleId AS articleId',
                  'COUNT(lk.id) AS likeCount',
                  `SUM(CASE WHEN lk.userId = ${userId} THEN 1 ELSE 0 END ) AS checked`,
                ])
                .from(ArticleLikeEntity, 'lk')
                .groupBy('lk.articleId');
            },
            'articleLike',
            'articleLike.articleId = article.id',
          )
          .where('article.status = :status', {
            status: String(ARTICLE_STATE.public),
          })
          .andWhere((qb) => {
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
        return qb;
      }, 'article')
      // limit在这里有bug 重复的也会算成一条数据导致不准确，使用over代替
      .where('`article`.`rowid` between :start and :end', {
        start: (page - 1) * pageSize + 1,
        end: page * pageSize,
      });
    (getList.expressionMap.mainAlias as any).metadata =
      getList.connection.getMetadata(ArticleEntity);
    getList
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.category', 'category')
      // .leftJoinAndSelect(ArticleLinkTagEntity, 'link', 'link.articleId = article.id')
      .leftJoinAndSelect(CommentEntity, 'comment', 'comment.articleId = article.id')
      .leftJoinAndMapMany('article.tags', TagEntity, 'tags', 'tags.id = link.tagId')
      .select([
        'article.id',
        'article.title',
        'article.description',
        'article.createAt',
        'article.updateAt',
        'article.viewCount',
        'article.cover',
      ])
      .addSelect(['article.likeCount AS `like_count`', 'article.checked AS `like_checked`'])
      .addSelect('COUNT(comment.id) AS `article_commentCount`')
      .addSelect(['tags.id', 'tags.name'])
      .addSelect(['id', 'nickname', 'role', 'username', 'avatar'].map((i) => 'author.' + i))
      .addSelect(['id', 'name', 'description'].map((i) => 'category.' + i))
      .groupBy('article.id, link.id')
      .addGroupBy(sort.sort)
      .orderBy(sort.sort, sort.order);
    const [list, count] = await Promise.all([getList.getRawMany(), getCount.getCount()]);

    // 手动组装实体
    // like用COUNT的话，不能映射到实体，而且article再用getCount的话就没有raw数据，就不能拼接数据
    // 使用了left join(select...)不能组装entity
    const entityList = rawsToEntities<ArticleEntity>({
      entityName: 'article',
      rawList: list,
      valueJoinToArr: ['tags'],
      valueToNumArr: ['like_count', 'like_checked', 'article_commentCount'],
      omitArr: ['list_count'],
    });

    return {
      list: entityList,
      count,
    };
  }

  async findAllByCommentUser(pageDto: PageDto, userId: number) {
    const { page, pageSize } = pageDto;

    const sort: { sort: string; order: 'DESC' } = {
      sort: 'article.createAt',
      order: 'DESC',
    };

    const getList = getConnection().createQueryBuilder();
    const getCount = this.articleRepository
      .createQueryBuilder('article')
      .groupBy('article.id')
      .where('article.status = :status', {
        status: String(ARTICLE_STATE.public),
      })
      .andWhere((qb) => {
        return (
          'article.id IN ' +
          qb
            .subQuery()
            .select('comment.articleId')
            .from(CommentEntity, 'comment')
            .where({ userId })
            .andWhere((qb) => {
              return (
                'article.id IN ' +
                qb
                  .subQuery()
                  .select('comment.articleId')
                  .from(CommentEntity, 'comment')
                  .where({ userId })
                  .getQuery()
              );
            })
            .getQuery()
        );
      });
    getList
      .from<ArticleEntity>((qb) => {
        qb.select([
          'article.*',
          `ROW_NUMBER() OVER (ORDER BY ${sort.sort} ${sort.order}, article.id) AS \`rowid\``,
        ])
          .from(ArticleEntity, 'article')
          .leftJoinAndSelect(
            (qb2) => {
              return qb2
                .subQuery()
                .select([
                  'lk.id AS likeId',
                  'lk.userId AS userId',
                  'lk.articleId AS articleId',
                  'COUNT(lk.id) AS likeCount',
                  `SUM(CASE WHEN lk.userId = ${userId} THEN 1 ELSE 0 END ) AS checked`,
                ])
                .from(ArticleLikeEntity, 'lk')
                .groupBy('lk.articleId');
            },
            'articleLike',
            'articleLike.articleId = article.id',
          )
          .where('article.status = :status', {
            status: String(ARTICLE_STATE.public),
          })
          .andWhere((qb) => {
            return (
              'article.id IN ' +
              qb
                .subQuery()
                .select('comment.articleId')
                .from(CommentEntity, 'comment')
                .where({ userId })
                .getQuery()
            );
          });
        return qb;
      }, 'article')
      // limit在这里有bug 重复的也会算成一条数据导致不准确，使用over代替
      .where('`article`.`rowid` between :start and :end', {
        start: (page - 1) * pageSize + 1,
        end: page * pageSize,
      });
    (getList.expressionMap.mainAlias as any).metadata =
      getList.connection.getMetadata(ArticleEntity);
    getList
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.category', 'category')
      // .leftJoinAndSelect(ArticleLinkTagEntity, 'link', 'link.articleId = article.id')
      .leftJoinAndSelect(CommentEntity, 'comment', 'comment.articleId = article.id')
      .leftJoinAndMapMany('article.tags', TagEntity, 'tags', 'tags.id = link.tagId')
      .select([
        'article.id',
        'article.title',
        'article.description',
        'article.createAt',
        'article.updateAt',
        'article.viewCount',
        'article.cover',
      ])
      .addSelect(['article.likeCount AS `like_count`', 'article.checked AS `like_checked`'])
      .addSelect('COUNT(comment.id) AS `article_commentCount`')
      .addSelect(['tags.id', 'tags.name'])
      .addSelect(['id', 'nickname', 'role', 'username', 'avatar'].map((i) => 'author.' + i))
      .addSelect(['id', 'name', 'description'].map((i) => 'category.' + i))
      .groupBy('article.id, link.id')
      .addGroupBy(sort.sort)
      .orderBy(sort.sort, sort.order);
    const [list, count] = await Promise.all([getList.getRawMany(), getCount.getCount()]);

    // console.log('mmmmmmmmmm', getList.getQuery());
    // 手动组装实体
    // like用COUNT的话，不能映射到实体，而且article再用getCount的话就没有raw数据，就不能拼接数据
    // 使用了left join(select...)不能组装entity
    const entityList = rawsToEntities<ArticleEntity>({
      entityName: 'article',
      rawList: list,
      valueJoinToArr: ['tags'],
      valueToNumArr: ['like_count', 'like_checked', 'article_commentCount'],
      omitArr: ['list_count'],
    });

    return {
      list: entityList,
      count,
    };
  }

  updateViewCount(article: ArticleEntity) {
    this.articleRepository
      .createQueryBuilder()
      .update()
      .set({ viewCount: ++article.viewCount })
      .where({ id: article.id })
      .execute();
  }

  async findOneBase(id: number) {
    return this.articleRepository.findOneBy({ id });
  }

  async findOne(id: number | string, user?: UserEntity) {
    const getArticle = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'user')
      .leftJoinAndMapMany('article.tags', TagEntity, 'tag', 'tag.id = link.tagId')
      .leftJoinAndSelect('article.category', 'category')
      .where({ id })
      .select([
        'article.id',
        'article.title',
        'article.description',
        'article.content',
        'article.createAt',
        'article.updateAt',
        'article.cover',
        'article.bgm',
        'article.status',
        // DATE_FORMAT(article.createAt,'%Y-%m-%d %H:%i:%s')
        // 'UNIX_AtSTAMP(article.createAt) createAt',
        // 'UNIX_AtSTAMP(article.updateAt) updateAt',
        'article.viewCount',
        'article.commentLock',
        'article.deletedAt',
      ])
      .addSelect(['id', 'nickname', 'role', 'avatar'].map((i) => 'user.' + i))
      .addSelect(['tag.id', 'tag.name'])
      .addSelect(['category.id', 'category.name'])
      .withDeleted();

    const article = await getArticle.getOne();
    if (!article) throw new NotFoundException('文章不存在');

    /* (article as any).tags = raw.map((item) => ({
      id: item.tag_id,
      name: item.tag_name,
    }));*/
    // (article as any).createAt = article.createAt.getAt();
    // (article as any).updateAt = article.updateAt.getAt();

    if (user?.id === ROLE.superAdmin) return article;

    if (article.deletedAt) throw new NotFoundException('文章不存在');

    if (article.status === ARTICLE_STATE.private) {
      if (user?.id === article.author.id) return article;
      throw new NotFoundException('文章不存在');
    }

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

  async update(id: number, updateArticleDto: UpdateArticleDto, userId: number) {
    const articleIns = new ArticleEntity();
    Object.assign(articleIns, {
      ...omit(updateArticleDto, ['isPublic']),
      status: Number(updateArticleDto.isPublic),
    });
    articleIns.updateAt = new Date();
    articleIns.id = id;
    articleIns.authorId = userId;
    articleIns.tags =
      updateArticleDto.tags?.map((tag) => Object.assign(new TagEntity(), { id: tag })) || [];

    return await this.articleRepository.save(articleIns);
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
