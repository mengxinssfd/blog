import { Injectable, NotFoundException } from '@nestjs/common';
import { PageDto } from '@blog/dtos/page.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ArticleEntity,
  CommentDislikeEntity,
  CommentEntity,
  CommentLikeEntity,
  UserEntity,
} from '@blog/entities';
import { rawsToEntities } from '@/utils/assemblyEntity';
import { PageVo } from '@blog/dtos/page.vo';
import { CreateCommentDto } from '@blog/dtos';
import { FindOperator } from 'typeorm/find-options/FindOperator';

enum EntityAlias {
  comment = 'comment',
  article = 'article',
  user = 'user',
  reply = 'reply',
}
type AliasProp = `${EntityAlias.comment}.${keyof CommentEntity}`;
type ArticleProp = `${EntityAlias.article}.${keyof ArticleEntity}`;

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
  ) {}

  async getTotal() {
    const alias = 'like';
    return await this.commentRepository
      .createQueryBuilder(alias)
      .select([
        `COUNT(${alias}.id) AS total`,
        `SUM(CASE WHEN \`${alias}\`.\`deletedAt\` IS NOT NULL THEN 1 ELSE 0 END) AS \`delete\``,
        `SUM(CASE WHEN \`${alias}\`.\`deletedAt\` IS NULL THEN 1 ELSE 0 END) AS \`common\``,
      ])
      .withDeleted()
      .getRawOne();
  }

  count(
    where: Partial<{
      [K in keyof CommentEntity]: CommentEntity[K] | FindOperator<CommentEntity[K]>;
    }>,
  ) {
    return this.commentRepository.createQueryBuilder('comment').where(where).getCount();
  }

  create(dto: CreateCommentDto, comment: CommentEntity) {
    comment.content = dto.content;
    dto.parentId && (comment.parentId = dto.parentId);
    dto.replyId && (comment.replyId = dto.replyId);
    comment.article = Object.assign(new ArticleEntity(), { id: comment.articleId });
    if (comment.user) {
      comment.user = Object.assign(new UserEntity(), { id: comment.userId });
    }
    return this.commentRepository.save(comment);
  }

  async findAll(dto: PageDto): Promise<PageVo<CommentEntity>> {
    const alias = 'comment';
    const getComment = this.createFindAllBuilder('', 1);
    const getCount = getComment.clone();
    getComment
      .orderBy(`${alias}.createAt`, 'DESC')
      .limit(dto.pageSize)
      .offset((dto.page - 1) * dto.pageSize)
      .leftJoin('comment.article', 'article')
      .addSelect(['comment.touristEmail', 'comment.ip'] satisfies AliasProp[])
      .addSelect(['article.id', 'article.as', 'article.title'] satisfies ArticleProp[]);

    const count = await getCount.getCount();
    let list: CommentEntity[] = [];

    if (count) list = this.handlerFindAllResult(await getComment.getRawMany(), false).list;

    return { list, count };
  }

  async findRecent(ip: string, userId = 0, limit = 10): Promise<CommentEntity[]> {
    const alias = 'comment';
    const getComment = this.createFindAllBuilder(ip, userId)
      .orderBy(`${alias}.createAt`, 'DESC')
      .limit(limit)
      .leftJoin('comment.article', 'article')
      .addSelect(['article.id', 'article.as'] satisfies ArticleProp[]);
    const list = await getComment.getRawMany();

    return this.handlerFindAllResult(list).list;
  }

  createFindAllBuilder(ip: string, userId: number) {
    const alias = 'comment';
    return (
      this.commentRepository
        .createQueryBuilder(alias)
        .leftJoinAndSelect(`${alias}.user` satisfies AliasProp, 'user')
        // .leftJoinAndSelect(`${alias}.replyUser` satisfies AliasProp, 'replyUser')
        .leftJoin(
          (sqb) => {
            return sqb
              .select([
                'commentId',
                'COUNT(like.id) AS like_count',
                `SUM(CASE WHEN like.userId = ${userId} OR like.touristIp = '${ip}' THEN 1 ELSE 0 END ) AS like_checked`,
              ])
              .from(CommentLikeEntity, 'like')
              .groupBy('commentId');
          },
          'like',
          `like.commentId = ${alias}.id`,
        )
        .addSelect(['like_count', `like_checked`])
        .leftJoin(
          (sqb) => {
            return sqb
              .select([
                'commentId',
                'COUNT(dislike.id) AS dislike_count',
                `SUM(CASE WHEN dislike.userId = ${userId} OR dislike.touristIp = '${ip}' THEN 1 ELSE 0 END ) AS dislike_checked`,
              ])
              .from(CommentDislikeEntity, 'dislike')
              .groupBy('commentId');
          },
          'dislike',
          `dislike.commentId = ${alias}.id`,
        )
        .addSelect(['dislike_count', `dislike_checked`])
        .addSelect(['comment.createAt'])
    );
  }

  handlerFindAllResult(list: unknown[], removeIp = true) {
    const arr = rawsToEntities<CommentEntity>({
      omitArr: removeIp ? ['ip'] : [],
      entityName: 'comment',
      valueToNumArr: ['dislike_checked', 'dislike_count', 'like_checked', 'like_count'],
      rawList: list,
    });
    return {
      list: arr,
      count: arr.length,
    } satisfies PageVo<CommentEntity>;
  }

  async findAllByArticle(
    articleId: number,
    ip: string,
    userId = 0,
  ): Promise<PageVo<CommentEntity>> {
    const alias = 'comment';

    const getComment = this.createFindAllBuilder(ip, userId)
      .where({ articleId })
      .orderBy(`${alias}.id`, 'DESC');

    const list = await getComment.getRawMany();
    return this.handlerFindAllResult(list);
  }

  async findOne(id: number): Promise<CommentEntity> {
    const find = await this.commentRepository.createQueryBuilder('comment').where({ id }).getOne();

    if (!find) throw new NotFoundException(`id:${id}不存在`);

    return find;
  }

  async findOneFull(id: number): Promise<CommentEntity> {
    const rep = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .addSelect(['comment.touristEmail'] satisfies `comment.${keyof CommentEntity}`[])
      .addSelect(['user.email', 'user.role'] satisfies `user.${keyof UserEntity}`[]);

    const find = await rep
      .clone()
      .leftJoinAndSelect('comment.article', 'article')
      .addSelect(['article.as'] satisfies `article.${keyof ArticleEntity}`[])
      .leftJoinAndSelect('article.author', 'author')
      .addSelect(['author.email', 'author.role'] satisfies `author.${keyof UserEntity}`[])
      .where({ id })
      .getOne();

    if (!find) throw new NotFoundException(`id:${id}不存在`);

    if (find.parentId)
      find.parent = (await rep.clone().where({ id: find.parentId }).getOne()) as CommentEntity;

    if (find.replyId)
      find.reply = (await rep.clone().where({ id: find.replyId }).getOne()) as CommentEntity;

    return find;
  }

  // 删除过的也查
  async findBaseOneWithDeleted(id: number): Promise<CommentEntity> {
    const find = await this.commentRepository
      .createQueryBuilder('comment')
      .select()
      .where({ id })
      .withDeleted()
      .getOne();

    if (!find) throw new NotFoundException(`id:${id}不存在`);

    return find;
  }

  async remove(id: number) {
    const res = await this.commentRepository.softDelete(id);
    return { affected: res.affected };
  }

  async findReplyMeAll(
    userId: number,
    { page, pageSize }: PageDto,
  ): Promise<PageVo<CommentEntity>> {
    const rep = this.commentRepository.manager
      .createQueryBuilder()
      .from((qb) => {
        return qb
          .from(CommentEntity, EntityAlias.comment)
          .addSelect([
            `${EntityAlias.comment}.id AS id`,
            `${EntityAlias.comment}.userId AS userId`,
            `${EntityAlias.comment}.content`,
            `${EntityAlias.comment}.createAt`,
            `${EntityAlias.comment}.deletedAt`,
            `${EntityAlias.comment}.touristName`,
          ])
          .addSelect(
            `ROW_NUMBER() OVER (ORDER BY ${EntityAlias.comment}.createAt DESC, ${EntityAlias.comment}.id) AS rowId`,
          )
          .leftJoin(`${EntityAlias.comment}.article`, EntityAlias.article)
          .addSelect([
            `${EntityAlias.article}.id`,
            `${EntityAlias.article}.title`,
            `${EntityAlias.article}.authorId`,
          ] satisfies `${EntityAlias.article}.${keyof ArticleEntity}`[])
          .leftJoin(`${EntityAlias.comment}.reply`, EntityAlias.reply)
          .where(
            `(${EntityAlias.article}.authorId = :userId OR ${EntityAlias.reply}.userId = :userId)`,
            { userId },
          );
      }, EntityAlias.comment)
      .addSelect([`${EntityAlias.comment}.*`])
      // 子查询内部已经判断了是否null，外部的判断就可以去掉了
      .withDeleted();

    // 解决报错(没有alias)问题
    rep.expressionMap.mainAlias!.metadata = rep.connection.getMetadata(CommentEntity);

    const count = await rep.clone().getCount();

    rep.leftJoinAndSelect(`${EntityAlias.comment}.user`, EntityAlias.user);
    rep.where(`${EntityAlias.comment}.rowId between :start and :end`, {
      start: (page - 1) * pageSize + 1,
      end: page * pageSize,
    });

    const rawList = await rep.getRawMany();
    // console.log(count, rawList);
    const entities = rawsToEntities<CommentEntity>({
      omitArr: ['rowId'],
      entityName: EntityAlias.comment,
      rawList,
    });
    // console.log(entities);
    return { count, list: entities };
  }
}
