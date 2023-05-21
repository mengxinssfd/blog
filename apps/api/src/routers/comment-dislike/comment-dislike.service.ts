import { Injectable, NotFoundException } from '@nestjs/common';
import { PageDto } from '@blog/dtos/page.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentDislikeEntity } from '@blog/entities';
import { BaseLikeService } from '@/common/service/base.like.service';

@Injectable()
export class CommentDislikeService extends BaseLikeService<CommentDislikeEntity> {
  constructor(
    @InjectRepository(CommentDislikeEntity)
    override readonly likeRepository: Repository<CommentDislikeEntity>,
  ) {
    super(likeRepository);
  }
  // 我的点赞列表
  async findMyAll(userId: number, pageDto: PageDto) {
    const getList = await this.likeRepository
      .createQueryBuilder('commentLike')
      .select()
      .where({ userId })
      .leftJoinAndSelect('commentLike.user', 'user')
      .leftJoinAndSelect('commentLike.comment', 'comment')
      .take(pageDto.pageSize)
      .skip((pageDto.page - 1) * pageDto.pageSize);
    return await getList.getMany();
  }
  // 全部user的点赞列表
  async findAll(pageDto: PageDto) {
    const list = await this.likeRepository
      .createQueryBuilder('commentLike')
      .select()
      .leftJoinAndSelect('commentLike.user', 'user')
      .leftJoinAndSelect('commentLike.comment', 'comment')
      .take(pageDto.pageSize)
      .skip((pageDto.page - 1) * pageDto.pageSize)
      .getMany();

    return list;
  }

  async findOne(id: number) {
    const res = await this.likeRepository.findOne({
      where: { id },
      select: ['id', 'userId', 'commentId'],
    });
    if (!res) throw new NotFoundException(`id({${id})不存在`);
    return res;
  }

  async setCommentDislike(userId: number, ip: string, commentId: number) {
    const rep = this.likeRepository
      .createQueryBuilder('like')
      .addSelect(['like.deletedAt'])
      .where({ commentId })
      .withDeleted();

    if (userId) {
      rep.andWhere({ userId });
    } else {
      rep.andWhere(`(touristIp = :ip AND userId IS NULL)`, { ip });
    }

    let like = await rep.getOne();

    if (!like) {
      like = new CommentDislikeEntity();
      like.touristIp = ip;
      like.userId = userId;
      like.commentId = commentId;
    }

    await this.setLike(like);
    return this.countByWhere(like, { commentId });
  }
}
