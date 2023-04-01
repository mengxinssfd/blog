import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity, ArticleLikeEntity } from '@blog/entities';
import { Repository } from 'typeorm';
import { BaseLikeService } from '@/common/service/base.like.service';
import { PageDto } from '@blog/dtos/page.dto';
import { PageVo } from '@blog/dtos/page.vo';

@Injectable()
export class ArticleLikeService extends BaseLikeService<ArticleLikeEntity> {
  constructor(
    @InjectRepository(ArticleLikeEntity)
    override readonly likeRepository: Repository<ArticleLikeEntity>,
    @InjectRepository(ArticleEntity)
    readonly articleRepository: Repository<ArticleEntity>,
  ) {
    super(likeRepository);
  }

  // 我的点赞列表
  async findAllByUserId(userId: number, pageDto: PageDto): Promise<PageVo<ArticleLikeEntity>> {
    const getList = await this.likeRepository
      .createQueryBuilder('like')
      .select()
      .where({ userId })
      .leftJoinAndSelect('like.user', 'user')
      .leftJoinAndSelect('like.article', 'article')
      .take(pageDto.pageSize)
      .skip((pageDto.page - 1) * pageDto.pageSize);
    const res = await getList.getManyAndCount();
    return { list: res[0], count: res[1] };
  }

  // 全部user的点赞列表
  async findAll(pageDto: PageDto): Promise<PageVo<ArticleLikeEntity>> {
    const res = await this.likeRepository
      .createQueryBuilder('like')
      .select()
      .leftJoinAndSelect('like.user', 'user')
      .leftJoin('like.article', 'article')
      .leftJoinAndSelect('article.category', 'cate')
      .leftJoinAndSelect('article.tags', 'tag')
      .leftJoinAndSelect('article.author', 'author')
      .addSelect([
        'article.title',
        'article.id',
        'article.description',
      ] satisfies Array<`article.${keyof ArticleEntity}`>)
      .take(pageDto.pageSize)
      .skip((pageDto.page - 1) * pageDto.pageSize)
      .getManyAndCount();

    return { list: res[0], count: res[1] };
  }

  async findOne(id: number): Promise<ArticleLikeEntity> {
    const res = await this.likeRepository.findOne({
      where: { id },
      select: ['id', 'userId', 'articleId'],
    });
    if (!res) throw new NotFoundException();
    return res;
  }

  async findSelfOne(where: Partial<ArticleLikeEntity>): Promise<ArticleLikeEntity> {
    const find = await this.likeRepository
      .createQueryBuilder('like')
      .where(where)
      .leftJoinAndSelect('like.user', 'user')
      .leftJoinAndSelect('like.article', 'article')
      .addSelect([
        'like.userId',
        'like.articleId',
        'like.deletedAt',
      ] satisfies Array<`like.${keyof ArticleLikeEntity}`>)
      .addSelect(['article.deletedAt'] satisfies Array<`article.${keyof ArticleEntity}`>)
      .withDeleted()
      .getOne();

    if (!find) throw new NotFoundException(`该点赞不存在`);

    return find;
  }

  async setArticleLike(
    like: ArticleLikeEntity,
  ): ReturnType<typeof ArticleLikeService.prototype.countByWhere> {
    await this.setLike(like);
    return this.countByWhere(like, { articleId: like.articleId });
  }
}
