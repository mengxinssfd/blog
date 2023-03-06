import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity, ArticleLikeEntity } from '@blog/entities';
import { Repository } from 'typeorm';
import { BaseLikeService } from '@/common/service/base.like.service';
import { PageDto } from '@blog/dtos/page.dto';

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
  async findAllByUserId(userId: number, pageDto: PageDto) {
    const getList = await this.likeRepository
      .createQueryBuilder('like')
      .select()
      .where({ userId })
      .leftJoinAndSelect('article-like.user', 'user')
      .leftJoinAndSelect('article-like.article', 'article')
      .take(pageDto.pageSize)
      .skip((pageDto.page - 1) * pageDto.pageSize);
    return await getList.getMany();
  }
  // 全部user的点赞列表
  async findAll(pageDto: PageDto) {
    const list = await this.likeRepository
      .createQueryBuilder('like')
      .select()
      .leftJoinAndSelect('like.user', 'user')
      .leftJoin('like.article', 'article')
      .addSelect([
        'article.title',
        'article.id',
        'article.description',
      ] as `article.${keyof ArticleEntity}`[])
      .take(pageDto.pageSize)
      .skip((pageDto.page - 1) * pageDto.pageSize)
      .getMany();

    return list;
  }

  async findOne(id: number) {
    const res = await this.likeRepository.findOne({
      where: { id },
      select: ['id', 'userId', 'articleId'],
    });
    if (!res) throw new NotFoundException();
    return res;
  }

  async setArticleLike(articleId: number, ip: string, userId?: number) {
    const like = new ArticleLikeEntity();
    like.articleId = articleId;
    await this.setLike(like, ip, userId);
    return this.countByWhere(like, { articleId: like.articleId });
  }
}
